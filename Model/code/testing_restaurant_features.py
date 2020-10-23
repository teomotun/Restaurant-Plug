import numpy as np
import pandas as pd
import h5py

# Paths
DATA_HOME = "/content/drive/My Drive/Yelp-Restaurant-Classification/Model/data/"
FEATURES_HOME = '/content/drive/My Drive/Yelp-Restaurant-Classification/Model/features/'

# Get photo->business mapping from the file provided
test_photo_to_biz_ids = pd.read_csv(DATA_HOME + 'test_photo_to_biz.csv')[:395500]

# Get business ids
business_ids = test_photo_to_biz_ids['business_id'].unique()
print("Total test business:", len(business_ids))

# Reading stored features from h5 file
test_features_file = h5py.File(FEATURES_HOME + 'test_features.h5', 'r')
# test_features = test_features_file['feature']
# test_features_file.close()

print(test_features_file['feature'][0])

# Create a pandas dataframe to make the data ready for training the SVM classifier in the following format
# Note that there will not be 'label' column as this is the actual testing data provided by Yelp
test_df = pd.DataFrame(columns=['business_id', 'feature'])

id = 0
for business_id in business_ids:
    """
        For each business, write the values for the above tuple in the file viz. ['business_id', 'feature']
    """

    # Get all the images which represent the current business with business_id
    images_for_business_id = test_photo_to_biz_ids[test_photo_to_biz_ids['business_id'] == business_id].index.tolist()

    # images_for_business_id[0]:(images_for_business_id[-1]+1)
    # As a feature for current business, take the average over all the images
    feature = list(
        np.mean(np.asarray(test_features_file['feature'][:395500,:][images_for_business_id[0]:(images_for_business_id[-1] + 1)]),
                axis=0))

    # Put the tuple into the data frame
    test_df.loc[business_id] = [business_id, feature]
    id += 1
    if id % 100 == 0:
        print("ID:", id)

print("Test business feature extraction is completed.")
test_features_file.close()

# Write the above data frame into a csv file
with open(FEATURES_HOME + 'test_aggregated_features.csv', 'w') as business_features_file:
    test_df.to_csv(business_features_file, index=False)