# Dependencies
import openweathermapy.core as owm
import datetime
import pandas as pd
import numpy as np
import requests
import json

def get_lon_lat(city,country_code,units):
    """
        This function gets weather forecast, lon and lat.
        Input: "(city, country and units as parameters)"
        Output: (forecast_data, lon, lat)
    """
    # Open weather API
    url = "http://api.openweathermap.org/data/2.5/weather?"
    weather_key = "bf0eb865eaf1ab307e6b534d32a3da6f"
    # Build partial query URL
    query_url = f"{url}appid={weather_key}&units={units}&q="

    response = requests.get(query_url + city).json()
    lon = response['coord']['lon']
    lat = response['coord']['lat']
    temp = response['main']['temp']

    # Create settings parameters
    settings = {"units": units, "APPID": weather_key}

    # Make the API call using owm's get_fourcast_hourly method
    forecast = owm.get_forecast_hourly(f"{city}, {country_code}", **settings)

    # Extract the date in text format and the temperature from each record
    # and save them in a list
    summary = ["dt_txt", "main.temp",
               "main.humidity", "wind.speed", "weather", ]
    data = [hourly_forecast(*summary) for hourly_forecast in forecast]
    #data is a list of tuples

    forecast_data = {
        "date_time": [],
        "temp": [],
        "humidity": [],
        "wind.speed": [],
        "description": []
    }
    # format the printing of each record
    for hourly_forecast in data:
        forecast_data["date_time"].append(hourly_forecast[0])
        forecast_data["temp"].append(hourly_forecast[1])
        forecast_data["humidity"].append(hourly_forecast[2])
        forecast_data["wind.speed"].append(hourly_forecast[3])
        forecast_data["description"].append(
            hourly_forecast[4][0]["description"])

    description = forecast_data['description']
    conversion_dict = {}
    i = 0
    unique_categories = list(np.unique(np.array(description)))
    for desc in unique_categories:
        conversion_dict[f"{desc}"] = i
        i += 1

    converted_description = []
    for desc in description:
        converted_description.append(conversion_dict[desc])
    forecast_data["conv_description"] = converted_description
    forecast_data["categories"] = unique_categories

    return (forecast_data, lon, lat)
