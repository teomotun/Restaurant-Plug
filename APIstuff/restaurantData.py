# Dependencies
import openweathermapy.core as owm
import datetime
import pandas as pd
import numpy as np
import requests
import json


class str2(str):
    def __repr__(self):
        # Allow str.__repr__() to do the hard work, then
        # remove the outer two characters, single quotes,
        # and replace them with double quotes.
        return ''.join(("'", super().__repr__()[1:-1], "'"))


def get_restaurant_data(lon, lat, pred):
    """
        This function gets weather forecast, lon and lat.
        Input: "(city, country, unit)"
        Output: 2 Dictionaries - The second is a transpose of
        the first - containing:
                    name, address, price_level, 
                    rating, business_status, 
                    open_now, lon, lat,rank
        for each predicted class
    """
    base_labels = [
        'good_for_lunch',
        'good_for_dinner',
        'takes_reservations',
        'outdoor_seating',
        'restaurant_is_expensive',
        'has_alcohol',
        'has_table_service',
        'ambience_is_classy',
        'good_for_kids'
    ]

    predictions = list(pred)
    labels = [base_labels[pred] for pred in predictions]

    # Preprocess labels
    formatted_labels = [" ".join(label.split("_")) for label in labels]
    labels_dict = {}

    # find the closest restaurant of each type to coordinates
    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    google_key = "AIzaSyDeJW7z55_Mj8dcPpo8rIPFiNX7SqOWLS0"
    
    # set up a parameters dictionary
    target_coordinates = f"{lat},{lon}"
    target_radius = 8000
    target_type = "restaurant"

    params = {
        "location": target_coordinates,
        "radius": target_radius,  # prominence is default ranking
        "type": target_type,
        "key": google_key
    }

    # use iterrows to iterate through pandas dataframe
    for label in formatted_labels:
        # get restaurant type from df
        if label == "has table service":
            restr_type = "table"
        elif label == "ambience is classy":
            restr_type = "classy"
        elif label == "has alcohol":
            restr_type = "liquor"
        elif label == "good for lunch":
            restr_type = "lunch"
        elif label == "good for kids":
            restr_type = "kids"
        elif label == "takes reservations":
            restr_type = "reservations"
        elif label == "restaurant is expensive":
            restr_type = "expensive"
        elif label == "outdoor_seating":
            restr_type = "outdoor_seating"
        else:
            restr_type = "dinner"

        # add keyword to params dict
        params['keyword'] = restr_type
        # assemble url and make API request

        response = requests.get(base_url, params=params).json()
        # extract results
        resultss = response['results']

        name = []
        address = []
        price_level = []
        rating = []
        business_status = []
        open_now = []
        lon_list = []
        lat_list = []
        rank = []
        rank_no = 1
        for result in resultss:
            try:
                name.append(str2(result['name']))
                rank.append(str2(rank_no))
                try:
                    address.append(str2(result['vicinity']))
                except:
                    address.append('')
                try:
                    price_level.append(str2(str(result['price_level'])))
                except:
                    price_level.append('')
                try:
                    rating.append(str2(str(result['rating'])))
                except:
                    rating.append('')
                try:
                    business_status.append(str2(result['business_status']))
                except:
                    business_status.append('')
                try:
                    open_now.append(str2(result['opening_hours']['open_now']))
                except:
                    open_now.append('')
                try:
                    lat_list.append(
                        str2(str(result['geometry']['location']['lat'])))
                except:
                    lat_list.append('')
                try:
                    lon_list.append(
                        str2(str(result['geometry']['location']['lng'])))
                except:
                    lon_list.append('')
                rank_no += 1
            except:
                pass
        dict_key = "_".join(label.split(" "))
        labels_dict[dict_key] = {
            'name': name,
            'address': address,
            'price_level': price_level,
            'rating': rating,
            'business_status': business_status,
            'open_now': open_now,
            'lon': lon_list,
            'lat': lat_list,
            'rank': rank
        }

    # Transform the dictionary
    new_labels_dict = {}
    for outer_key in list(labels_dict.keys()):
        new_dict = pd.DataFrame(labels_dict[outer_key]).T.to_dict()
        new_labels_dict[outer_key] = [new_dict[inner_key]
                                      for inner_key in list(new_dict.keys())]
    return (new_labels_dict, labels_dict, labels)
