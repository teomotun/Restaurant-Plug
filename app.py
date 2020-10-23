import os
import json
from APIstuff.lonLat import get_lon_lat
from Model.code.get_prediction import get_predictions
#from APIstuff.config import google_key
from APIstuff.restaurantData import get_restaurant_data
from flask import Flask, flash, request, redirect, url_for, render_template, session, jsonify, Response
from werkzeug.utils import secure_filename
from flask_dropzone import Dropzone
from flask_uploads import UploadSet, configure_uploads, IMAGES, patch_request_class
from PIL import Image
import io
import base64
import time
from absl import app, logging
import cv2
import numpy as np
from flask import Flask, request, Response, jsonify, send_from_directory, abort
import os


# customize API through the following parameters
# Paths
CAFFE_HOME = "/Model/caffe/"
DATA_HOME = "/Model/data/"
MODELS_HOME = '/Model/model/'
RESTAURANT_HOME = '/static/uploads/'

#  path to output folder where images with detections are saved
output_path = 'static/uploads/'
country = None
state_city = None
unit = None
# load in weights and classes

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
upload = os.getcwd() + '/uploads/'
detection = os.getcwd() + '/static/detections/'

app = Flask(__name__)
dropzone = Dropzone(app)


# Dropzone settings
app.config['DROPZONE_UPLOAD_MULTIPLE'] = True
app.config['DROPZONE_ALLOWED_FILE_CUSTOM'] = True
app.config['DROPZONE_ALLOWED_FILE_TYPE'] = 'image/*'
app.config['DROPZONE_MAX_FILE_SIZE'] = 1
#app.config['DROPZONE_REDIRECT_VIEW'] = 'index'

# Uploads settings
app.config['UPLOADED_PHOTOS_DEST'] = os.getcwd() + '/uploads'
app.config['SECRET_KEY'] = 'supersecretkeygoeshere'

photos = UploadSet('photos', IMAGES)
configure_uploads(app, photos)
patch_request_class(app)  # set maximum file size, default is 16MB

@app.route('/', methods=['GET', 'POST'])
def index():
	filelist = [f for f in os.listdir(upload)]
	for f in filelist:
		if f != ".DS_Store":
			print(f)
			os.remove(os.path.join(upload, f))

	# set session for image results
	if "file_urls" not in session:
		session['file_urls'] = []
	# list to hold our uploaded image urls
	file_urls = session['file_urls']

	# handle image upload from Dropszone
	if request.method == 'POST':
		file_obj = request.files
		for f in file_obj:
			file = request.files.get(f)
			try:
				# save the file with to our photos folder
				filename = photos.save(
					file,
					name=file.filename
				)
				# append image urls
				file_urls.append(photos.url(filename))
			except:
				pass
		session['file_urls'] = file_urls
	# return dropzone template on GET request
	return render_template('index.html', response=" ", img_response=" ", img_filenames=" ")


@app.route('/state_city_txt', methods=['POST'])
def state_city_txt():
	global state_city
	json1 = request.get_json()
	state_city = json1['status']
	state_city = state_city.title()
	if state_city:
		return jsonify(result1=state_city)
	else:
		return jsonify(result1="")


@app.route('/country_txt', methods=['POST'])
def country_txt():
	global country
	json2 = request.get_json()
	country = json2['status']
	country = country.upper()
	if country:
		return jsonify(result2=country)
	else:
		return jsonify(result2="")


@app.route('/unit_txt', methods=['POST'])
def unit_txt():
	global unit
	json3 = request.get_json()
	unit = json3['status']
	unit = unit.lower()
	if unit:
		return jsonify(result3=unit)
	else:
		return jsonify(result3="")


@app.route('/show_results', methods=['POST'])
def show_result():
	
	try:
		image_paths = [RESTAURANT_HOME+f.strip() for f in os.listdir(RESTAURANT_HOME)
                 if os.path.isfile(RESTAURANT_HOME + f) and f != ".DS_Store"]

		pred = get_predictions(image_paths, CAFFE_HOME, DATA_HOME, MODELS_HOME)
		pred = list(pred[0])
	except Exception as e:
		print(e)
	
	pred = [0, 1, 2, 3, 4, 5, 6, 7, 8]
	try:
		forecast_data, lon, lat = get_lon_lat(state_city, country, unit)
		print("Gotten Coordinates")
		new_labels_dict, labels, labels = get_restaurant_data(lon, lat, pred)
		#print(new_labels_dict)
		response ={ 
			'forecast_data': forecast_data,
			'restaurant_dict': new_labels_dict,
			'unit': unit,
			'labels': labels
		}
	except Exception as e:
		print(e)
		response = ""
	print(response)
	# , response=get_detections())
	return render_template('index2.html', response=response)

if __name__ == "__main__":
		app.run(host='0.0.0.0', debug=True, threaded=True)
