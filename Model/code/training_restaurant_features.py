import pandas as pd
import h5py

# Paths
DATA_HOME = "/content/drive/My Drive/Yelp-Restaurant-Classification/Model/data/"
FEATURES_HOME = '/content/drive/My Drive/Yelp-Restaurant-Classification/Model/features/'

# Get photo->business mapping from the file provided
train_photo_to_biz_ids = pd.read_csv(DATA_HOME + 'train_photo_to_biz_ids.csv')

# Get labels for businesses in the training data
train_data_business = pd.read_csv(DATA_HOME + 'train.csv').dropna()

# Sort these labels in the ascending order for simplicity e.g. (0, 6, 4, 2, 5) -> (0, 2, 4, 5, 6)
train_data_business['labels'] = train_data_business['labels'].apply(
    lambda feature_vector: tuple(sorted(int(feature) for feature in feature_vector.split())))
train_data_business.set_index('business_id', inplace=True)

# Get business ids
business_ids = train_data_business.index.unique()
print("Total train business:", len(business_ids))

# Reading stored features from h5 file
train_features_file = h5py.File(FEATURES_HOME + 'train_features.h5', 'r')
train_features = np.copy(train_features_file['feature'])
train_features_file.close()

# Create a pandas dataframe to make the data ready for training the SVM classifier in the following format
train_df = pd.DataFrame(columns=['business_id', 'label', 'feature'])

for business_id in business_ids:
    """
        For each business, write the values for the above triplet in the file viz. ['business_id', 'label', 'feature']
    """
    business_id = int(business_id)

    # Get the labels for the current business
    label = train_data_business.loc[business_id]['labels']

    # Get all the images which represent the current business with business_id
    images_for_business_id = train_photo_to_biz_ids[train_photo_to_biz_ids['business_id'] == business_id].index.tolist()

    # As a feature for current business, take the average over all the images
    feature = list(np.mean(train_features[images_for_business_id], axis=0))

    # Put the triplet into the data frame
    train_df.loc[business_id] = [business_id, label, feature]

print("Train business feature extraction is completed.")

# Write the above data frame into a csv file
with open(FEATURES_HOME + 'train_aggregate_features.csv', 'w') as business_features_file:
    train_df.to_csv(business_features_file, index=False)