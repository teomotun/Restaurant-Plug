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


function makeResponsive() {
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 20,
        right: 40,
        bottom: 100,
        left: 100,
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

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {
        var label;

        if (chosenXAxis === "humidity") {
            label = "Humidity:";
        } else if (chosenXAxis === "temp") {
            label = "Temperature:";
        } else {
            label = "Wind Speed:";
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
        .text("Temperature");

    var humidityLabel = labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "humidity") // value to grab for event listener
        .classed("inactive", true)
        .text("Humidity");

    var wind_speedLabel = labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "wind_speed") // value to grab for event listener
        .classed("inactive", true)
        .text("Wind Speed");

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
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);