import numpy as np
import pandas as pd
import tarfile
import skimage
import io
import h5py
import os
import caffe
import time

# Paths
CAFFE_HOME = "/content/drive/My Drive/Yelp-Restaurant-Classification/Model/caffe/"
DATA_HOME = "/content/drive/My Drive/Yelp-Restaurant-Classification/Model/data/"
FEATURES_HOME = '/content/drive/My Drive/Yelp-Restaurant-Classification/Model/features/'
DATA_ = "/content/"
# Model creation
# Using bvlc_reference_caffenet model for training
import os
if os.path.isfile(CAFFE_HOME + 'models/bvlc_reference_caffenet/bvlc_reference_caffenet.caffemodel'):
    print('CaffeNet found.')
else:
    print('Downloading pre-trained CaffeNet model...')
    #os.system('/caffe/scripts/download_model_binary.py /caffe/models/bvlc_reference_caffenet')
    !python /content/drive/My\ Drive/Yelp-Restaurant-Classification/Model/caffe/scripts/download_model_binary.py /content/drive/My\ Drive/Yelp-Restaurant-Classification/Model/caffe//models/bvlc_reference_caffenet

model_def = CAFFE_HOME + 'models/bvlc_reference_caffenet/deploy.prototxt'
model_weights = CAFFE_HOME + 'models/bvlc_reference_caffenet/bvlc_reference_caffenet.caffemodel'

# Create a net object 
model = caffe.Net(model_def,      # defines the structure of the model
            model_weights,  # contains the trained weights
            caffe.TEST)     # use test mode (e.g., don't perform dropout)

# set up transformer - creates transformer object
transformer = caffe.io.Transformer({'data': model.blobs['data'].data.shape})
# transpose image from HxWxC to CxHxW 
transformer.set_transpose('data', (2, 0, 1))
transformer.set_mean('data', np.load(CAFFE_HOME + 'python/caffe/imagenet/ilsvrc_2012_mean.npy').mean(1).mean(1))
# set raw_scale = 255 to multiply with the values loaded with caffe.io.load_image 
transformer.set_raw_scale('data', 255)
# swap image channels from RGB to BGR 
transformer.set_channel_swap('data', (2, 1, 0))


def extract_features(image_paths):
    """
        This function is used to extract feature from the current batch of photos.
        Features are extracted using the pretrained bvlc_reference_caffenet
        Instead of returning 1000-dim vector from SoftMax layer, using fc7 as the final layer to get 4096-dim vector
    """
    test_size = len(image_paths)
    model.blobs['data'].reshape(test_size, 3, 227, 227)
    model.blobs['data'].data[...] = list(map(lambda x: transformer.preprocess('data', skimage.img_as_float(skimage.io.imread(x)).astype(np.float32) ), image_paths))
    out = model.forward()
    return model.blobs['fc7'].data

if not os.path.isfile(FEATURES_HOME + 'test_features.h5'):
    """
        If this file doesn't exist, create a new one and set up two columns: photoId, feature
    """
    file = h5py.File(FEATURES_HOME + 'test_features.h5', 'w')
    photoId = file.create_dataset('photoId', (0,), maxshape=(None,), dtype='|S54')
    feature = file.create_dataset('feature', (0, 4096), maxshape=(None, 4096), dtype=np.dtype('int16'))
    file.close()

# If this file exists, then track how many of the images are already done.
file = h5py.File(FEATURES_HOME + 'test_features.h5', 'r+')
already_extracted_images = len(file['photoId'])
file.close()

# Get testing images and their business ids
test_data = pd.read_csv(DATA_HOME + 'test_photo_to_biz.csv')
test_photo_paths = [os.path.join(DATA_ + 'test_photos/', str(photo_id) + '.jpg') for photo_id in
                     test_data['photo_id']]

# Each batch will have 500 images for feature extraction
test_size = 395500#len(test_photo_paths)
batch_size = 500
batch_number = round(already_extracted_images / batch_size + 1,3)
hours_elapsed = 0

print("Total images:", test_size)
print("already_done_images: ", already_extracted_images-500)

# Feature extraction of the test dataset
for image_count in range(already_extracted_images, test_size, batch_size):
    start_time = round(time.time(),3)
    # Get the paths for images in the current batch
    image_paths = test_photo_paths[image_count: min(image_count + batch_size, test_size)]

    # Feature extraction for the current batch
    features = extract_features(image_paths)

    # Update the total count of images done so far
    total_done_images = image_count + features.shape[0]

    # Storing the features in h5 file
    file = h5py.File(FEATURES_HOME + 'test_features.h5', 'r+')
    try:
      file['photoId'].resize((total_done_images,))
      file['photoId'][image_count: total_done_images] = np.array(image_paths,dtype='|S54')
      file['feature'].resize((total_done_images, features.shape[1]))
      file['feature'][image_count: total_done_images, :] = features
      file.close()
    except Exception as e:
      print(e)
      file.close()

    print("Batch No:", batch_number, "\tStart:", image_count, "\tEnd:", image_count + batch_size, "\tTime elapsed:", hours_elapsed, "hrs", "\tCompleted:", round(float(
        image_count + batch_size) / float(test_size) * 100,3), "%")
    batch_number += 1
    hours_elapsed += round(((time.time() - start_time)/60)/60,3)