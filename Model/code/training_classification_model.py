import numpy as np
import statistics
import pandas as pd
import time
import os

from sklearn.metrics import f1_score, accuracy_score
from sklearn.multiclass import OneVsRestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.model_selection import cross_val_predict
from sklearn.externals import joblib

def get_labels(label_string):
    """
        This function converts label from string to array of labels
        Input: "(1, 2, 3, 4, 5)"
        Output: [1, 2, 3, 4, 5]
    """
    label_array = label_string[1:-1]
    label_array = label_array.split(',')
    label_array = [int(label) for label in label_array if len(label) > 0]
    return label_array


def get_features(feature_string):
    """
        This function converts feature vector from string to array of features
        Input: "(1.2, 3.4, ..., 9.10)"
        Output: [1.2, 3.4, ..., 9.10]
    """
    feature_array = feature_string[1:-1]
    feature_array = feature_array.split(',')
    feature_array = [float(label) for label in feature_array]
    return feature_array


# Set home paths for data and features
DATA_HOME = "/content/drive/My Drive/Yelp-Restaurant-Classification/Model/data/"
FEATURES_HOME = '/content/drive/My Drive/Yelp-Restaurant-Classification/Model/features/'
MODELS_HOME = '/content/drive/My Drive/Yelp-Restaurant-Classification/Model/model/'

# Read training data and test data
train_data = pd.read_csv(FEATURES_HOME + 'train_aggregate_features.csv')

# Separate the labels from features in the training data
trainX = np.array([get_features(feature) for feature in train_data['feature']])
trainY = np.array([get_labels(label) for label in train_data['label']])

# Use validation data for calculating the training accuracy, random_state ensures reproducible results without overfitting
trainX, validationX, trainY, validationY = train_test_split(trainX, trainY, test_size=0.3, random_state=42)

# Binary representation (just like one-hot vector) (1, 3, 5, 9) -> (1, 0, 1, 0, 1, 0, 0, 0, 1)
mlb = MultiLabelBinarizer()
trainY = mlb.fit_transform(trainY)

# Do the same for validation labels
actual_labels = validationY
mlb = MultiLabelBinarizer()
validationY = mlb.fit_transform(validationY)

svc_clf = OneVsRestClassifier(SVC(kernel='linear', probability=True, verbose=True))
rf_clf = RandomForestClassifier(n_estimators=200, oob_score=True, n_jobs=-1, random_state=42)
knn_clf = KNeighborsClassifier()
extra_tree_clf = ExtraTreesClassifier(n_estimators=195, max_leaf_nodes=16, n_jobs=-1, random_state=42)


for clf in [svc_clf, rf_clf, knn_clf, extra_tree_clf]:
    if not os.path.isfile(MODELS_HOME + f'{clf.__class__.__name__}.pkl'):
      # Start time
        start_time = time.time()

        # Fit the classifier on the training data and labels
        clf.fit(trainX, trainY)
        cross_val = cross_val_predict(clf, validationX, validationY, cv=3)

        print(f"{clf.__class__.__name__} trained.")

        joblib.dump((mlb,clf), MODELS_HOME + f'{clf.__class__.__name__}.pkl')
        print("Model saved.")
        
        # End time
        end_time = time.time()

        print(f"Overall F1 Score for {clf.__class__.__name__}:", f1_score(cross_val, validationY, average='micro'))
        print(f"Individual F1 Score for {clf.__class__.__name__}:", f1_score(cross_val, validationY, average=None))
        print(f"Variance of {clf.__class__.__name__} is:", statistics.variance(f1_score(cross_val, validationY, average=None)))
        print(f"Time taken for training the {clf.__class__.__name__}", end_time - start_time, "sec")
        print("======================================================")
        print("\n")

    mlb,clf = joblib.load(MODELS_HOME + f'{clf.__class__.__name__}'+".pkl")

    print(f"{clf.__class__.__name__} Model loaded.")

    # Predict the labels for the validation data
    preds_binary = clf.predict(validationX)

    # Predicted labels are converted back
    # (1, 0, 1, 0, 1, 0, 0, 0, 1) -> (1, 3, 5, 9)
    predicted_labels = mlb.inverse_transform(preds_binary)

    print("Validation Set Results:")
    print(f"Overall F1 Score for {clf.__class__.__name__}:", f1_score(preds_binary, validationY, average='micro'))
    print(f"Individual F1 Score for {clf.__class__.__name__}:", f1_score(preds_binary, validationY, average=None))
    print(f"Variance of {clf.__class__.__name__} is:", statistics.variance(f1_score(preds_binary, validationY, average=None)))
    print("======================================================")


X_train_1, X_train_2, y_train_1, y_train_2 = train_test_split(trainX, trainY, random_state=42)


svc_clf = OneVsRestClassifier(SVC(kernel='linear', probability=True, verbose=True))
rf_clf = RandomForestClassifier(n_estimators=200, oob_score=True, n_jobs=-1, random_state=42)
knn_clf = KNeighborsClassifier()
extra_tree_clf = ExtraTreesClassifier(n_estimators=195, max_leaf_nodes=16, n_jobs=-1, random_state=42)


start_time = time.time()
rnd_clf_2 = RandomForestClassifier(random_state=42)

for p in [svc_clf, rf_clf, knn_clf, extra_tree_clf]:
    p.fit(X_train_1, y_train_1)

svc_clf_p = svc_clf.predict(X_train_2)
rf_clf_p = rf_clf.predict(X_train_2)
knn_clf_p = knn_clf.predict(X_train_2)

held_out = np.column_stack((svc_clf_p, rf_clf_p, knn_clf_p))
rnd_clf_2.fit(held_out, y_train_2)

result_1 = []
for p in [svc_clf, rf_clf, knn_clf]:
    result_1.append(p.predict(validationX))

y_pred_s = rnd_clf_2.predict(np.column_stack(tuple(result_1)))
# End time
end_time = time.time()

print(f"Time taken for training the Stacked Model:", end_time - start_time, "sec")
print(f"Overall Stacked F1 Score for:", f1_score(y_pred_s, validationY, average='micro'))
print(f"Overall Stacked F1 Score for:", f1_score(y_pred_s, validationY, average=None))
print(f"Variance of Stacked Model is:", statistics.variance(f1_score(y_pred_s, validationY, average=None)))