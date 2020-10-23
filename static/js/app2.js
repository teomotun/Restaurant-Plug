var my_table = d3.select("#my-table");
var table_area = d3.select("#table-area");
var forecast_graph = d3.select("#forecast_graph");
var foreecast_area = d3.select("#weather");
var map_area = d3.select("#restaurant");
var map = d3.select("#map");

var labelElement = d3.select("#sel_class");
var weather = forecast_data;

var lat_list = [];
var lon_list = [];


function option1() {
    $("#restaurant").show();
    $("#weather").hide();
};

function option2() {
    $("#restaurant").hide();
    $("#weather").show();
};

function buildTable(label) {

    data = restaurant_dict[label];


    my_table
        .select("tbody")
        .selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
        .html(function(d) {
            new_time = d.business_status;

            return `<td>${d.rank}</td>
            <td>${d.name}</td>
            <td>${d.address}</td>
            <td>${d.price_level}</td>
            <td>${d.rating}</td>
            <td>
            ${
              d.business_status
              .split(" ")
              .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
              .join(" ").replace(/_/g, " ")
            }
            </td>
            <td>${d.open_now}</td>`;
        });
};

function init() {

    Object.keys(restaurant_dict).forEach((data) => {
        var drop = labelElement.append("option");
        data = data.replace(/_/g, " ").toUpperCase();
        // Append text and value
        drop.text(data);
        drop.property("value", data.replace(/ /g, "_").toLowerCase());
    });

    label = Object.keys(restaurant_dict)[0];

    buildTable(label);
    buildMap(label, lat_list, lon_list);
    // When the browser loads, makeResponsive() is called.
    makeResponsive(forecast_data, unit);
    console.log(lat_list);
    console.log(lon_list);
    // option1();
};

// d3.select("#option1").on("click", option1());
// d3.select("#option2").on("click", option2());

init();

// Function called by DOM changes
function get_new_label() {
    // Assign the value of the dropdown menu option to a variable
    lat_list = [];
    lon_list = [];
    var label = labelElement.property("value");

    console.log(label.replace(/_/g, " ").toUpperCase());
    // Empty the table data before query
    d3.select("tbody").html("");
    buildTable(label);
    buildMap(label, lat_list, lon_list);
    console.log(lat_list);
    console.log(lon_list);
};


function average(coordinates) {
    return coordinates.reduce((a, b) => a + b) / coordinates.length;
};


function buildMap(label, lat_list, lon_list) {
    document.querySelector(".map-container").innerHTML =
        "<div id='mapid' style='width: 100%; height: 100%;'></div>";
    data = restaurant_dict[label];

    for (var i = 0; i < data.length; i++) {
        lat_list.push(parseFloat(data[i]["lat"]));
        lon_list.push(parseFloat(data[i]["lon"]));
    }
    var center_lat = average(lat_list);
    var center_lon = average(lon_list);
    console.log(center_lat);
    console.log(center_lon);

    // Create the tile layer that will be the background of our map
    var API_KEY =
        "pk.eyJ1IjoidGVvbW90dW4iLCJhIjoiY2tnaTJnb3cwMDl6MTJycGM1YWYxa3J0bSJ9.jOPKk54RaW3u_SgqZSpM-w";

    var lightmap = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: "mapbox.light",
            accessToken: API_KEY,
        }
    );

    var darkmap = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: "mapbox.dark-v11",
            accessToken: API_KEY,
        }
    );

    // Only one base layer can be shown at a time
    var baseMaps = {
        Light: lightmap,
        Dark: darkmap,
    };

    console.log(API_KEY);
    // Initialize all of the LayerGroups we'll be using
    var layers = {
        OPEN_NOW: new L.LayerGroup(),
        CLOSED: new L.LayerGroup(),
        NOT_SURE: new L.LayerGroup(),
    };

    // Create the map with our layers
    var map = L.map("mapid", {
        center: [center_lat, center_lon],
        zoom: 12,
        layers: [layers.OPEN_NOW, layers.CLOSED, layers.NOT_SURE],
    });

    // Add our 'lightmap' tile layer to the map
    lightmap.addTo(map);

    // Create an overlays object to add to the layer control
    var overlays = {
        "OPEN NOW": layers.OPEN_NOW,
        "CLOSED": layers.CLOSED,
        "NOT SURE": layers.NOT_SURE,
    };

    // Create a control for our layers, add our overlay layers to it
    L.control.layers(baseMaps, overlays).addTo(map);

    // Create a legend to display information about our map
    var info = L.control({
        position: "bottomright",
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
            icon: "ion-minus-circled",
            iconColor: "white",
            markerColor: "green",
            shape: "penta",
        }),
        CLOSED: L.ExtraMarkers.icon({
            icon: "ion-minus-circled",
            iconColor: "white",
            markerColor: "red",
            shape: "penta",
        }),
        NOT_SURE: L.ExtraMarkers.icon({
            icon: "ion-minus-circled",
            iconColor: "white",
            markerColor: "yellow",
            shape: "penta",
        }),
    };

    // Create an object to keep of the number of markers in each layer
    var status = {
        OPEN_NOW: 0,
        CLOSED: 0,
        NOT_SURE: 0,
    };

    // Initialize a restaurantStatusCode, which will be used as a key to access the appropriate layers, icons, and status for layer group
    var restaurantStatusCode;

    // Loop through the stations (they're the same size and have partially matching data)
    for (var i = 0; i < data.length; i++) {
        if (data[i]["open_now"] == "True") {
            restaurantStatusCode = "OPEN_NOW";
        } else if (data[i]["open_now"] == "False") {
            restaurantStatusCode = "CLOSED";
        } else {
            restaurantStatusCode = "NOT_SURE";
        }

        // Update the station count
        status[restaurantStatusCode]++;
        // Create a new marker with the appropriate icon and coordinates
        var lat_lon = [];
        lat_lon.push(parseFloat(data[i]["lat"]));
        lat_lon.push(parseFloat(data[i]["lon"]));

        //console.log(lat_lon);
        var newMarker = L.marker(lat_lon, {
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
            data[i]["business_status"]
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
            .join(" ")
            .replace(/_/g, " ")
        );
    }

    // Call the updateLegend function, which will... update the legend!
    updateLegend(label, status);

    // Update the legend's innerHTML with the last updated time and station count
    function updateLegend(label1, status) {
        document.querySelector(".legend").innerHTML = [
            "<p>" + label1.replace(/_/g, " ").toUpperCase() + "</p>",
            "<p class='open-now'>OPEN NOW: " + status.OPEN_NOW + "</p>",
            "<p class='closed'>CLOSED: " + status.CLOSED + "</p>",
            "<p class='not-sure'>NOT SURE: " + status.NOT_SURE + "</p>",
        ].join("");
    }
};

var new_weather_list = [];

for (var i = 0; i < weather.date_time.length; i++) {
    var new_time = weather["date_time"][i].split(" ");
    new_time[1] = new_time[1].replace(/[0-9]{1,2}(:[0-9]{2}){2}/, function(
        time
    ) {
        var hms = time.split(":"),
            h = +hms[0],
            suffix = h < 12 ? "am" : "pm";
        hms[0] = h % 12 || 12;
        return hms.join(":").slice(0, 4) + suffix;
    });
    new_time2 = new_time.join(" ");
    new_weather_list.push({
        temp: weather["temp"][i],
        wind_speed: weather["wind.speed"][i],
        humidity: weather["humidity"][i],
        conv_description: weather["conv_description"][i],
        date_time: weather["date_time"][i],
        conv_date_time: Date.parse(weather["date_time"][i].replace(" ", "T")),
        description: weather["description"][i],
        formatted_time: new_time2,
        date: new_time[0],
    });
}








function makeResponsive(weather, unit) {
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    var new_weather_list = [];

    for (var i = 0; i < weather.date_time.length; i++) {
        var new_time = weather["date_time"][i].split(" ");
        new_time[1] = new_time[1].replace(/[0-9]{1,2}(:[0-9]{2}){2}/, function(
            time
        ) {
            var hms = time.split(":"),
                h = +hms[0],
                suffix = h < 12 ? "am" : "pm";
            hms[0] = h % 12 || 12;
            return hms.join(":").slice(0, 4) + suffix;
        });
        new_time2 = new_time.join(" ");
        new_weather_list.push({
            temp: weather["temp"][i],
            wind_speed: weather["wind.speed"][i],
            humidity: weather["humidity"][i],
            conv_description: weather["conv_description"][i],
            date_time: weather["date_time"][i],
            conv_date_time: Date.parse(weather["date_time"][i].replace(" ", "T")),
            description: weather["description"][i],
            formatted_time: new_time2,
            date: new_time[0],
        });
    }

    console.log(new_weather_list);

    console.log(
        new_weather_list.map(function(d) {
            return d.formatted_time;
        })
    );

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth - 0.2 * window.innerHeight;;
    var svgHeight = window.innerHeight - 0.2 * window.innerHeight;

    var margin = {
        top: 20,
        right: 0,
        bottom: 100,
        left: 120,
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
        .select(".chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "temp";

    // function used for updating x-scale var upon click on axis label
    function xScale(Data, chosenXAxis) {
        // create scales
        var xLinearScale = d3
            .scaleLinear()
            .domain([
                d3.min(Data, (d) => d[chosenXAxis]) * 0.8,
                d3.max(Data, (d) => d[chosenXAxis]) * 1.2,
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition().duration(1000).call(bottomAxis);

        return xAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis) {
        circlesGroup
            .transition()
            .duration(1000)
            .attr("cx", (d) => newXScale(d[chosenXAxis]));

        return circlesGroup;
    }

    if (unit === "metric") {
        var t = "C";
    } else {
        var t = "F";
    }


    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {
        var label;

        if (chosenXAxis === "humidity") {
            label = "Humidity (%): ";
        } else if (chosenXAxis === "temp") {
            label = "Temperature (" + t + "): ";
        } else {
            label = "Wind Speed (m/s): ";
        }

        var toolTip = d3
            .tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return `
                ${d.formatted_time}<br>
                ${d.description
                  .split(" ")
                  .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
                  .join(" ")}<br>
                ${label} ${d[chosenXAxis]}`;
            });

        circlesGroup.call(toolTip);

        circlesGroup
            .on("mouseover", function(data) {
                toolTip.show(data);
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });

        return circlesGroup;
    }

    // parse data and make sure it's converted to numeric
    new_weather_list.forEach(function(data) {
        data.temp = +data.temp;
        data.humidity = +data.humidity;
        data.wind_speed = +data.wind_speed;
    });

    // yLinearScale function the created list
    var xLinearScale = xScale(new_weather_list, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3
        .scaleLinear()
        .domain([
            d3.min(new_weather_list, (d) => d.conv_date_time),
            d3.max(new_weather_list, (d) => d.conv_date_time),
        ])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup
        .append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g").call(leftAxis);
    // .ticks(20)
    // .tickFormat(function(d) {
    //     var tick = d.formatted_time;
    //     return tick;
    // });

    // append initial circles
    var circlesGroup = chartGroup
        .selectAll("circle")
        .data(new_weather_list)
        .enter()
        .append("circle")
        .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
        .attr("cy", (d) => yLinearScale(d["conv_date_time"]))
        .attr("r", 4)
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Create group for  3 x- axis labels
    var labelsGroup = chartGroup
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var tempLabel = labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "temp") // value to grab for event listener
        .classed("active", true)
        .text("Temperature (" + t + ")");

    var humidityLabel = labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "humidity") // value to grab for event listener
        .classed("inactive", true)
        .text("Humidity (%)");

    var wind_speedLabel = labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "wind_speed") // value to grab for event listener
        .classed("inactive", true)
        .text("Wind Speed (m/s)");

    // append y axis
    chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Time Point");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            // replaces chosenYAxis with value
            chosenXAxis = value;

            // console.log(chosenYAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(new_weather_list, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "temp") {
                tempLabel.classed("active", true).classed("inactive", false);
                humidityLabel.classed("active", false).classed("inactive", true);
                wind_speedLabel.classed("active", false).classed("inactive", true);
            } else if (chosenXAxis === "humidity") {
                tempLabel.classed("active", false).classed("inactive", true);
                humidityLabel.classed("active", true).classed("inactive", false);
                wind_speedLabel.classed("active", false).classed("inactive", true);
            } else {
                tempLabel.classed("active", false).classed("inactive", true);
                humidityLabel.classed("active", false).classed("inactive", true);
                wind_speedLabel.classed("active", true).classed("inactive", false);
            }
        }
    });

    console.log("Working!")
}

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive(forecast_data, unit));