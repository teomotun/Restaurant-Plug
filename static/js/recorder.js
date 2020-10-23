var buttonRecord = document.getElementById("record");
var buttonStop = document.getElementById("stop");
var button_show_detected_image = document.getElementById("show_detected_image");
// var detect = document.getElementById("show_results");

buttonStop.disabled = true;

buttonRecord.onclick = function () {
  // var url = window.location.href + "record_status";
  buttonRecord.disabled = true;
  buttonStop.disabled = false;

  // disable download link
  var downloadLink = document.getElementById("download");
  downloadLink.text = "";
  downloadLink.href = "";

  // XMLHttpRequest
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // alert(xhr.responseText);
    }
  };
  xhr.open("POST", "/record_status");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ status: "true" }));
};

buttonStop.onclick = function () {
  buttonRecord.disabled = false;
  buttonStop.disabled = true;

  // XMLHttpRequest
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // alert(xhr.responseText);

      // enable download link
      // var downloadLink = document.getElementById("download");
      // downloadLink.text = "Download Video";
      // downloadLink.href = "/static/downloads/video.mp4";
      var download = document.getElementById("download");
      download.innerHTML =
        '<i class="fas fa-download m-auto text-primary"></i>';
      download.text = "DOWNLOAD VIDEO";
      download.href = "./static/downloads/video.mp4";
    }
  };
  xhr.open("POST", "/record_status");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ status: "false" }));
};

// button_show_detected_image.onclick = function () {
//   // var url = window.location.href + "record_status";
//   // buttonRecord.disabled = true;
//   // buttonStop.disabled = false;

//   // disable download link
//   // var downloadLink = document.getElementById("download");
//   // downloadLink.text = "";
//   // downloadLink.href = "";

//   // XMLHttpRequest
//   var xhr = new XMLHttpRequest();
//   xhr.onreadystatechange = function () {
//     if (xhr.readyState == 4 && xhr.status == 200) {
//       // alert(xhr.responseText);
//     }
//   };
//   xhr.open("POST", "/detections");
//   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   xhr.send(JSON.stringify({ status: "true" }));
// };
try {
  get_result.onclick = function () {
    show_results();
  }
}
catch {
  console.log("yippie");
};
