// Select the button
var dropzone = d3.select("#dropzone");
var show_button = d3.select("#show_resultss");
var country_codeElement = d3.select("#countrycode");
var state_cityElement = d3.select("#statecity");
var unitElement = d3.select("#unit");

country_codeElement.on("change", function() {
    // Get the value property of the input element
    var country_codeValue = country_codeElement.property("value");
    console.log(country_codeValue);
    // XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //alert(xhr.responseText);
        }
    };
    xhr.open("POST", "/country_txt");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ status: country_codeValue }));
});

state_cityElement.on("change", function() {
    // Get the value property of the input element
    var state_cityValue = state_cityElement.property("value");
    console.log(state_cityValue);
    // XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // alert(xhr.responseText);
        }
    };
    xhr.open("POST", "/state_city_txt");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ status: state_cityValue }));
});

unitElement.on("change", function() {
    // Get the value property of the input element
    var unitValue = unitElement.property("value");
    console.log(unitValue);
    // XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // alert(xhr.responseText);
        }
    };
    xhr.open("POST", "/unit_txt");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ status: unitValue }));
});

function init() {
    //show_button.style.display = "none";
    document.getElementById("countrycode").reset();
    document.getElementById("statecity").reset();
    document.getElementById("unit").reset();
}

dropzone.on("readystatechange", function() {
    show_button.style.display = "block";
});

init();