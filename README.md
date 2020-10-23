# Restaurant-Plug



### Description:
In this project, a web app was built to classify restaurant images using a trained model and Flask. The model automatically tags restaurants with multiple labels using a dataset of user-submitted photos. Currently, restaurant labels are manually selected by Yelp users when they submit a review. Selecting the labels is optional, leaving some restaurants un- or only partially-categorized. 
In an age of food selfies and photo-centric social storytelling, it may be no surprise to hear that Yelp's users upload an enormous amount of photos every day alongside their written reviews. 

### You must have ..
* [Numpy] - For handling the datasets   (```pip install numpy```)
* [Pandas] - For handling the datasets  (```pip install pandas```)
* [Scikit Learn] - To use classification algorithms like SVM    (```pip install -U scikit-learn```)
* [Python]
* [Flask] - To spin up a light weight server
* [Requests] - To make calls to a RestAPI

The following dependencies are only required if you wish to extract image and business features from scratch. 

* [H5Py] - To store the features extracted from CNN (```pip install h5py```)
* [Caffe] - To extract features from the images (Refer to the [link](http://caffe.berkeleyvision.org/))

### Dataset:
Again if you choose to extract image and business features from scratch, you will need this dataset. It is available [here](https://www.kaggle.com/c/yelp-restaurant-photo-classification/data). Dataset description is also available. Download and extract the files/folders in the "data" directory.

### For ease of project execution, we have already extracted the features and stored in the following files:

| Filename                    | Size    | Description                                                                                                                   | Command that was used for generation                                   |
|-----------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| train_features.h5           | 3.59 GB | Format: [PhotoId, ImageFeatures] This file contains ImageNet features of training dataset                                     | ```python extract_image_features_train.py```    |
| test_features.h5            | 18.2 GB | Format: [PhotoId, ImageFeatures] This file contains ImageNet features of test dataset                                         | ```python extract_image_features_test.py```     |
| [train_aggregated_features.csv](https://drive.google.com/file/d/1-OOFJ8wAUSJlanKdGC7hn6TaZgs3Lvg0/view?usp=sharing) | 91.7 MB | Format: [BusinessId, BusinessFeatures, ClassLabels] This file contains features extracted for businesses in training dataset. These features are extracted using train_features.h5.  | ```python extract_business_features_train.py``` |
| [test_aggregated_features.csv](https://drive.google.com/file/d/1-OJ7rTfjO7sg7EnjFb0WQTywb0SVcO4a/view?usp=sharing)  | 460 MB  | Format: [BusinessId, BusinessFeatures] This file contains features extracted for businesses in test dataset. These features are extracted using test_features.h5.                   | ```python extract_business_features_test.py```  |





   [Numpy]: <http://www.numpy.org/>
   [Pandas]: <http://pandas.pydata.org/>
   [Caffe]: <http://caffe.berkeleyvision.org/>
   [H5Py]: <http://www.h5py.org/>
   [Scikit Learn]: <http://scikit-learn.org/stable/>
   [Python]: <https://www.python.org/>
