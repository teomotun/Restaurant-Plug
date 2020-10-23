function average(coordinates) {
    return coordinates.reduce((a, b) => a + b) / coordinates.length;
};


function buildMap(label) {
    data = restaurant_dict[label];
    var center_lat = average(lat_list);
    var center_lon = average(lon_list);

    // Create the tile layer that will be the background of our map
    // const API_KEY =
    //     "pk.eyJ1IjoidGVvbW90dW4iLCJhIjoiY2tnaTJnb3cwMDl6MTJycGM1YWYxa3J0bSJ9.jOPKk54RaW3u_SgqZSpM-w";

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    console.log("API_KEY");
    // Initialize all of the LayerGroups we'll be using
    var layers = {
        OPEN_NOW: new L.LayerGroup(),
        CLOSED: new L.LayerGroup(),
    };

    // Create the map with our layers
    var map = L.map("map", {
        center: [center_lat, center_lon],
        zoom: 12,
        layers: [layers.OPEN_NOW, layers.CLOSED],
    });

    // Add our 'lightmap' tile layer to the map
    lightmap.addTo(map);

    // Create an overlays object to add to the layer control
    var overlays = {
        "OPEN NOW": layers.OPEN_NOW,
        "CLOSED": layers.CLOSED
    };

    // Create a control for our layers, add our overlay layers to it
    L.control.layers(null, overlays).addTo(map);

    // Create a legend to display information about our map
    var info = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        return div;
    };
    // Add the info legend to the map
    info.addTo(map);

    // Initialize an object containing icons for each layer group
    var icons = {
        OPEN_NOW: L.ExtraMarkers.icon({
            icon: "fa-cutlery ",
            iconColor: "white",
            markerColor: "green",
            shape: "penta",
        }),
        CLOSED: L.ExtraMarkers.icon({
            icon: "fa-cutlery ",
            iconColor: "white",
            markerColor: "red",
            shape: "star",
        })
    };

    // Create an object to keep of the number of markers in each layer
    var status = {
        OPEN_NOW: 0,
        CLOSED: 0
    };

    // Initialize a restaurantStatusCode, which will be used as a key to access the appropriate layers, icons, and status for layer group
    var restaurantStatusCode;

    // Loop through the stations (they're the same size and have partially matching data)
    for (var i = 0; i < data.length; i++) {

        if (data[i]["open_now"] == "True") {
            restaurantStatusCode = "OPEN_NOW";
        }
        // Otherwise the restaurant is closed
        else {
            restaurantStatusCode = "CLOSED";
        }

        // Update the station count
        status[restaurantStatusCode]++;
        // Create a new marker with the appropriate icon and coordinates
        var newMarker = L.marker([data[i]["lat"], data[i]["lon"]], {
            icon: icons[restaurantStatusCode],
        });

        // Add the new marker to the appropriate layer
        newMarker.addTo(layers[restaurantStatusCode]);

        // Bind a popup to the marker that will  display on click. This will be rendered as HTML
        newMarker.bindPopup(
            data[i]["name"] +
            "<br> Address: " +
            data[i]["address"] +
            "<br> Rating: " +
            data[i]["rating"] +
            "<br> Rank: " +
            data[i]["rank"] +
            "<br> Price Level: " +
            data[i]["price_level"] +
            "<br> Business Status: " +
            titleCase(data[i]["business_status"])
        );
    }

    // Call the updateLegend function, which will... update the legend!
    updateLegend(label, status);


    // Update the legend's innerHTML with the last updated time and station count
    function updateLegend(label, status) {
        document.querySelector(".legend").innerHTML = [
            "<p>RESTAURANT CLASS: " + label.replace(/_/g, " ").toUpperCase() + "</p>",
            "<p class='open-now'>OPEN NOW: " + status.OPEN_NOW + "</p>",
            "<p class='closed'>CLOSED: " + status.CLOSED + "</p>"
        ].join("");
    }
};