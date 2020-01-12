'use strict';
console.log('camera script');

/* globals MediaRecorder */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var intervalTimer;
var startTime;
var finishTime;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
]).then(startVideo)


var gumVideo = document.querySelector('#video');
var $timer = document.querySelector('#timer');
var $stopBtn = document.querySelector('#stop');
var $startBtn= document.querySelector("#start");


// var recordButton = document.querySelector('button#record');
// var playButton = document.querySelector('button#play');
// var downloadButton = document.querySelector('button#download');
// recordButton.onclick = toggleRecording;
// playButton.onclick = play;
// downloadButton.onclick = download;

// window.isSecureContext could be used for Chrome
// var isSecureOrigin = location.protocol === 'https:' || location.host === 'localhost';
// if (!isSecureOrigin) {
//   alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' + '\n\nChanging protocol to HTTPS');
//   location.protocol = 'HTTPS';
// }

// Use old-style gUM to avoid requirement to enable the
// Enable experimental Web Platform features flag in Chrome 49

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
  video: true
};



function successCallback(stream) {
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  if (window.URL) {
    gumVideo.srcObject = stream;
  } else {
    gumVideo.src = window.URL.createObjectURL(stream);
  }


  // Initiate Webcam recording.
  startRecording();
}


function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}

// navigator.mediaDevices.getUserMedia(constraints)
// .then(function(stream) {
//   console.log('getUserMedia() got stream: ', stream);
//   window.stream = stream; // make available to browser console
//   if (window.URL) {
//     gumVideo.src = window.URL.createObjectURL(stream);
//   } else {
//     gumVideo.src = stream;
//   }
// }).catch(function(error) {
//   console.log('navigator.getUserMedia error: ', error);
// });


function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}


function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

var downloadLink=document.getElementById("download");

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}


function toggleRecording() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
  }
}


const video = document.getElementById('video')




function startVideo()
{
    // navigator.getUserMedia(
    //     {video: {} },stream => video.srcObject = stream,
    //     err=> console.error(err)

    // )
}
// function startRecording (){

//     const canvas = faceapi.createCanvasFromMedia(video)
//     document.body.append(canvas)
//     console.log('working');
//     const displaysize = {width: video.width,height: video.height}
//     faceapi.matchDimensions(canvas,displaysize)
//     setInterval(async ()=>{
//         const detections = await faceapi.detectAllFaces(video, 
//         new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()  
//         const resizedDetections = faceapi.resizeResults(detections,displaysize)
//         canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height )
//         faceapi.draw.drawDetections(canvas,resizedDetections)
//         //faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
//     },100)
// }

// The nested try blocks will be simplified when Chrome 47 moves to Stable
async function startRecording() {
  var options = {
    videoBitsPerSecond : 25000,
    mimeType: 'video/webm',
  };
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    try {
      options = {
        videoBitsPerSecond : 250000,
        mimeType: 'video/webm,codecs=vp9',
      };
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1);
      try {
        options = 'video/vp8'; // Chrome 47
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e2) {
        alert('MediaRecorder is not supported by this browser.\n\n' + 'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
        console.error('Exception while creating MediaRecorder:', e2);
        return;
      }
    }
  }
  console.log('working');
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  // recordButton.textContent = 'Stop Recording';
  // playButton.disabled = true;
  // downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  await mediaRecorder.start(60000); // collect 10ms of data
//   const canvas = await faceapi.createCanvasFromMedia(gumVideo)
//     document.body.append(canvas)
//     const displaysize = {width: video.width,height: video.height}
//     faceapi.matchDimensions(canvas,displaysize)
//     setInterval(async ()=>{
//         const detections = await faceapi.detectAllFaces(video, 
//         new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()  
//         const resizedDetections = faceapi.resizeResults(detections,displaysize)
//         canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height )
//         faceapi.draw.drawDetections(canvas,resizedDetections)
//         //faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
//     },100)
  console.log('MediaRecorder started', mediaRecorder);
}

gumVideo.addEventListener('play',()=>{
    const canvas = faceapi.createCanvasFromMedia(gumVideo);
    canvas.style.position = 'absolute';
    console.log('canvas working')
    document.body.append(canvas)
    const displaysize = {width: gumVideo.width,height: gumVideo.height}
    faceapi.matchDimensions(canvas,displaysize)
    setInterval(async ()=>{
        const detections = await faceapi.detectAllFaces(gumVideo, 
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()  
        const resizedDetections = faceapi.resizeResults(detections,displaysize)
        canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height )
        faceapi.draw.drawDetections(canvas,resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
        // x1=resizedDetections[0]["landmarks"]["positions"][36]["x"];
        // x2=resizedDetections[0]["landmarks"]["positions"][40]["x"];
        // y1=resizedDetections[0]["landmarks"]["positions"][37]["y"];
        // y2=resizedDetections[0]["landmarks"]["positions"][41]["y"];
        console.log(resizedDetections['length']);
        console.log(resizedDetections);
    },100)
})


function timerTick() {
  var t = Date.parse(new Date()) - Date.parse(startTime);
  
  var seconds = Math.floor( (t/1000) % 60 );
  seconds = ('00' + seconds).slice(-2);
  var minutes = Math.floor( (t/1000/60) % 60 );
  minutes = ('00' + minutes).slice(-2);

  $timer.innerHTML = minutes + ':' + seconds;
}


function stopRecording() {
    mediaRecorder.stop();
  window.clearInterval(intervalTimer);
  console.log('Recorded Blobs: ', recordedBlobs);

  upload();
  var stream = video.srcObject;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }
}

function upload() {
  var blob = new Blob(recordedBlobs, { type: 'video/webm' });
//   downloadLink.href = URL.createObjectURL(blob);
//   downloadLink.download = 'acetest.webm';
  
const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type : 'audio/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test_'+getTimestamp()+'.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});
//  uploadData(blob);  
//   chrome.runtime.getBackgroundPage( (backgroundPage) => {
//     backgroundPage.uploadData(blob);
//     window.close();
//   });
}


// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.id == 'stop-recording') {
//     console.log('stop-recording message');
//     stopRecording();
//   }
// });


// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.id == 'close-camera-window') {
//     console.log('close-camera-window');
//     window.close();
//   }
// });


function init() {
  $timer.innerHTML = '00:00';
  navigator.getUserMedia(constraints, successCallback, errorCallback);
  startTime = new Date();
  intervalTimer = window.setInterval(function() {
    timerTick();
  }, 1000);
}

$startBtn.addEventListener('click',init);
$stopBtn.addEventListener('click', stopRecording);


function getTimestamp() {
    var e = new Date,
        t = e.getFullYear(),
        o = ("00" + (e.getMonth() + 1)).slice(-2),
        n = ("00" + e.getDate()).slice(-2),
        r = ("00" + e.getHours()).slice(-2),
        s = ("00" + e.getMinutes()).slice(-2),
        i = t + "-" + o + "-" + n + "_" + r + "-" + s;
    return i
}

//background js stuff

/*

function uploadData(e) {
    chrome.identity.getAuthToken({
        interactive: !1
    },
    function(t) {
        t ? (console.log("upload data with google auth token"), uploadVideo(t, videosFolderId, e).then(function(e) {
            e.downloadUrl;
            console.log(e);
            var o = "https://drive.google.com/uc?export=view&id=" + e.id;
            var j = e.alternateLink;
            console.log(j);
            console.log("view url:", o),
            console.log("short url: ", e), copyToClipboard(j), hideAlertMessage(), showAlertMessage("URL to the screenshot of this webpage has been put in your clipboard", 3), chrome.runtime.sendMessage({
                id: "close-camera-window"
            })
        })["catch"](function(e) {
            console.log(e)
        })) : console.log("can not get Google auth token")
    })
}

function uploadVideo(e, t, o) {
    return console.log("upload video"), new Promise(function(n, r) {
        var s = o,
            i = new MediaUploader({
                metadata: {
                    title: "WebCam_" + getTimestamp(),
                    mimeType: "video/webm",
                    parents: [{
                        id: t
                    }]
                },
                file: s,
                token: e,
                onComplete: function(e) {
                    console.log("Drive: upload successfull");
                    var t = JSON.parse(e);
                    n(t)
                },
                onError: function(e) {
                    console.log("Drive: upload error"), r(e)
                }
            });
        i.upload()
    })
}

function copyToClipboard(e) {
    var t = document.createElement("input");
    t.style.position = "fixed", t.style.opacity = 0, t.value = e, document.body.appendChild(t), t.select(), document.execCommand("Copy"), document.body.removeChild(t)
}

function showAlertMessage(e, t) {
    var o = 'showUserMessage("' + e + '", ' + t + ");";
    chrome.tabs.query({}, function(e) {
        console.log("tabs length:", e.length);
        for (var t = 0; t < e.length; t++) try {
            chrome.tabs.executeScript(e[t].id, {
                code: o
            })
        } catch (n) {
            console.log("cannot access this tab: ", t)
        }
    })
}

function hideAlertMessage() {
    var e = "hideUserMessage()";
    chrome.tabs.query({}, function(t) {
        console.log("tabs length:", t.length);
        for (var o = 0; o < t.length; o++) try {
            chrome.tabs.executeScript(t[o].id, {
                code: e
            })
        } catch (n) {
            console.log("cannot access this tab: ", o)
        }
    })
}


chrome.runtime.onInstalled.addListener(function(e) {
    console.log("previousVersion", e.previousVersion)
}), console.log("Event Page for Browser Action");
var videosFolderId, CAMERA_WINDOW_WIDTH = 480,
    CAMERA_WINDOW_HEIGHT = 270,
    MAXIMUM_MINUTES = 10,
    isRunning = !1,
    cameraWindow, DriveService = function(e) {
        this.token = e.token, this.folderName = "WebCam Record", this.metadata = e.metadata || {}
    };
DriveService.prototype.getFolderId = function() {
    var e = this;
    return console.log("drive: get folder id"), new Promise(function(t, o) {
        var n = e,
            r = "trashed = false and mimeType = 'application/vnd.google-apps.folder' and title = '" + e.folderName + "'";
        r = encodeURIComponent(r);
        var s = new XMLHttpRequest;
        s.open("GET", "https://www.googleapis.com/drive/v2/files?q=" + r, !0), s.setRequestHeader("Authorization", "Bearer " + e.token), s.setRequestHeader("Content-Type", "application/json"), s.onload = function(e) {
            if (200 == e.target.status || 201 == e.target.status) {
                var r = JSON.parse(e.target.response),
                    s = r.items[0];
                if (s) {
                    console.log("Drive: foldel exists");
                    var i = s.id;
                    t(i)
                } else console.log("Drive: folder doesnt exist yet"), n.createFolder(n.folderName).then(function(e) {
                    t(e)
                })["catch"](function(e) {
                    o(e)
                })
            } else console.log("Drive: get folder error"), o(e.target.response)
        }, s.onerror = function(e) {
            console.log("Drive: get folder error"), o(e.target.response)
        }, s.send(null)
    })
}, DriveService.prototype.createFolder = function(e, t) {
    var o = this;
    return console.log("Drive: create folder"), new Promise(function(n, r) {
        var s = {
            title: e,
            mimeType: "application/vnd.google-apps.folder"
        };
        t && (s.parents = [{
            id: t
        }]);
        var i = new XMLHttpRequest;
        i.open("POST", "https://www.googleapis.com/drive/v2/files", !0), i.setRequestHeader("Authorization", "Bearer " + o.token), i.setRequestHeader("Content-Type", "application/json"), i.onload = function(e) {
            if (200 == e.target.status || 201 == e.target.status) {
                console.log("Drive: folder created");
                var t = JSON.parse(e.target.response),
                    o = t.id;
                n(o)
            } else console.log("Drive: create folder error"), r(e.target.response)
        }, i.onerror = function(e) {
            console.log("Drive: create folder error"), r(e.target.response)
        }, i.send(JSON.stringify(s))
    })
};
var RetryHandler = function() {
    this.interval = 1e3, this.maxInterval = 6e4
};
RetryHandler.prototype.retry = function(e) {
    setTimeout(e, this.interval), this.interval = this.nextInterval_()
}, RetryHandler.prototype.reset = function() {
    this.interval = 1e3
}, RetryHandler.prototype.nextInterval_ = function() {
    var e = 2 * this.interval + this.getRandomInt_(0, 1e3);
    return Math.min(e, this.maxInterval)
}, RetryHandler.prototype.getRandomInt_ = function(e, t) {
    return Math.floor(Math.random() * (t - e + 1) + e)
};
var MediaUploader = function(e) {
    var t = function() {};
    if (this.file = e.file, this.contentType = e.contentType || this.file.type || "application/octet-stream", this.metadata = e.metadata || {
            title: this.file.name,
            mimeType: this.contentType
        }, this.token = e.token, this.onComplete = e.onComplete || t, this.onProgress = e.onProgress || t, this.onError = e.onError || t, this.offset = e.offset || 0, this.chunkSize = e.chunkSize || 0, this.retryHandler = new RetryHandler, this.url = e.url, !this.url) {
        var o = e.params || {};
        o.uploadType = "resumable", this.url = this.buildUrl_(e.fileId, o, e.baseUrl)
    }
    this.httpMethod = e.fileId ? "PUT" : "POST"
};
MediaUploader.prototype.upload = function() {
    var e = new XMLHttpRequest;
    e.open(this.httpMethod, this.url, !0), e.setRequestHeader("Authorization", "Bearer " + this.token), e.setRequestHeader("Content-Type", "application/json"), e.setRequestHeader("X-Upload-Content-Length", this.file.size), e.setRequestHeader("X-Upload-Content-Type", this.contentType), e.onload = function(e) {
        if (e.target.status < 400) {
            var t = e.target.getResponseHeader("Location");
            this.url = t, this.sendFile_()
        } else this.onUploadError_(e)
    }.bind(this), e.onerror = this.onUploadError_.bind(this), e.send(JSON.stringify(this.metadata))
}, MediaUploader.prototype.sendFile_ = function() {
    var e = this.file,
        t = this.file.size;
    (this.offset || this.chunkSize) && (this.chunkSize && (t = Math.min(this.offset + this.chunkSize, this.file.size)), e = e.slice(this.offset, t));
    var o = new XMLHttpRequest;
    o.open("PUT", this.url, !0), o.setRequestHeader("Content-Type", this.contentType), o.setRequestHeader("Content-Range", "bytes " + this.offset + "-" + (t - 1) + "/" + this.file.size), o.setRequestHeader("X-Upload-Content-Type", this.file.type), o.upload && o.upload.addEventListener("progress", this.onProgress), o.onload = this.onContentUploadSuccess_.bind(this), o.onerror = this.onContentUploadError_.bind(this), o.send(e)
}, MediaUploader.prototype.resume_ = function() {
    var e = new XMLHttpRequest;
    e.open("PUT", this.url, !0), e.setRequestHeader("Content-Range", "bytes /*" + this.file.size), e.setRequestHeader("X-Upload-Content-Type", this.file.type), e.upload && e.upload.addEventListener("progress", this.onProgress), e.onload = this.onContentUploadSuccess_.bind(this), e.onerror = this.onContentUploadError_.bind(this), e.send()
}, MediaUploader.prototype.extractRange_ = function(e) {
    var t = e.getResponseHeader("Range");
    t && (this.offset = parseInt(t.match(/\d+/g).pop(), 10) + 1)
}, MediaUploader.prototype.onContentUploadSuccess_ = function(e) {
    200 == e.target.status || 201 == e.target.status ? this.onComplete(e.target.response) : 308 == e.target.status ? (this.extractRange_(e.target), this.retryHandler.reset(), this.sendFile_()) : this.onContentUploadError_(e)
}, MediaUploader.prototype.onContentUploadError_ = function(e) {
    e.target.status && e.target.status < 500 ? this.onError(e.target.response) : this.retryHandler.retry(this.resume_.bind(this))
}, MediaUploader.prototype.onUploadError_ = function(e) {
    this.onError(e.target.response)
}, MediaUploader.prototype.buildQuery_ = function(e) {
    return e = e || {}, Object.keys(e).map(function(t) {
        return encodeURIComponent(t) + "=" + encodeURIComponent(e[t])
    }).join("&")
}, MediaUploader.prototype.buildUrl_ = function(e, t, o) {
    var n = o || "https://www.googleapis.com/upload/drive/v2/files/";
    e && (n += e);
    var r = this.buildQuery_(t);
    return r && (n += "?" + r), n
};*/