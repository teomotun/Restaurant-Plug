#%%writefile get_prediction.py
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.ensemble import RandomForestClassifier
import joblib
import numpy as np
import pandas as pd
import tarfile
import skimage
import io
import h5py
import os
#import caffe
import time


def get_predictions(image_paths, CAFFE_HOME, DATA_HOME, MODELS_HOME):
    """
        This function is used to make restaurant class prediction of photos from several directory paths.
        Features are extracted using the pretrained bvlc_reference_caffenet
        Instead of returning 1000-dim vector from SoftMax layer, using fc7 as the final layer to get 4096-dim vector.
        The features are the passed to a KNN multi label classifier
    """

    # Model creation
    # Using bvlc_reference_caffenet model for training
    import os
    if os.path.isfile(CAFFE_HOME + 'models/bvlc_reference_caffenet/bvlc_reference_caffenet.caffemodel'):
        print('CaffeNet found.')

    model_def = CAFFE_HOME + 'models/bvlc_reference_caffenet/deploy.prototxt'
    model_weights = CAFFE_HOME + \
        'models/bvlc_reference_caffenet/bvlc_reference_caffenet.caffemodel'

    # Create a net object
    model = caffe.Net(model_def,      # defines the structure of the model
                      model_weights,  # contains the trained weights
                      caffe.TEST)     # use test mode (e.g., don't perform dropout)

    # set up transformer - creates transformer object
    transformer = caffe.io.Transformer(
        {'data': model.blobs['data'].data.shape})
    # transpose image from HxWxC to CxHxW
    transformer.set_transpose('data', (2, 0, 1))
    transformer.set_mean('data', np.load(
        CAFFE_HOME + 'python/caffe/imagenet/ilsvrc_2012_mean.npy').mean(1).mean(1))
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
        model.blobs['data'].data[...] = list(map(lambda x: transformer.preprocess(
            'data', skimage.img_as_float(skimage.io.imread(x)).astype(np.float32)), image_paths))
        out = model.forward()
        return model.blobs['fc7'].data

    features = extract_features(image_paths)

    mlb, clf = joblib.load(MODELS_HOME + "KNeighborsClassifier.pkl")

    # Predict the labels for the validation data
    preds_binary = clf.predict(features)

    # Predicted labels are converted back
    # (1, 0, 1, 0, 1, 0, 0, 0, 1) -> (1, 3, 5, 9)
    predicted_labels = mlb.inverse_transform(preds_binary)
    return predicted_labels
