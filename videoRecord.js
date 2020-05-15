'use strict';
	
console.log('camera script');	

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var intervalTimer;
var autoUploading;
var startTime;
var finishTime;
var uploadTimer;
var gumVideo = document.querySelector('#video');
var $timer = document.querySelector('#timer');
var $stopBtn = document.querySelector('#stop');
var $startBtn= document.querySelector("#start");

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

//var downloadLink=document.getElementById("download");

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


// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
  var options = {
    videoBitsPerSecond : 250000,
    mimeType: 'video/webm',
  };
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") 
             ? "video/webm; codecs=vp9" 
             : "video/webm";
    try {
      options = {
        videoBitsPerSecond : 2500000,
        mimeType: mime,
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
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  // recordButton.textContent = 'Stop Recording';
  // playButton.disabled = true;
  // downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10000); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}


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
//   downloadLink.href = URL.createObjectURL(blob);
//   downloadLink.download = 'acetest.webm';
const downloadButton = document.querySelector('button#download');
let a_name="";
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type : 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a_name='test_'+getTimestamp()+'.webm';
  a.download = a_name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);  
});
console.log(recordedBlobs);
    var blob = new Blob(recordedBlobs, { type: 'video/webm' });
       const ref = firebase.storage().ref();
    const file = blob;
    const name = 'test_'+getTimestamp()+'.webm';
    const task = ref.child(name).put(file);
    task.then(function(snapshot) {
        console.log('Uploaded a blob or file!');
    })
    .catch(console.error);
}

function init() {
  $timer.innerHTML = '00:00';
  navigator.getUserMedia(constraints, successCallback, errorCallback);
  startTime = new Date();
  uploadTimer= new Date();
  intervalTimer = window.setInterval(function() {
    timerTick();
  }, 1000);
  autoUploading = window.setInterval(function(){
    startTime = new Date();
    $timer.innerHTML = '00:00';
    stopRecording();
    navigator.getUserMedia(constraints, successCallback, errorCallback);
    intervalTimer = window.setInterval(function() {
      timerTick();
    }, 1000);
  },30000);
}

function stopAutoUploading(){
  window.clearInterval(autoUploading);
}

if($startBtn){
$startBtn.addEventListener('click',init);
$stopBtn.addEventListener('click', stopRecording);
$stopBtn.addEventListener('click', stopAutoUploading);
}

function getTimestamp() {
    var e = new Date,
        t = e.getFullYear(),
        o = ("00" + (e.getMonth() + 1)).slice(-2),
        n = ("00" + e.getDate()).slice(-2),
        r = ("00" + e.getHours()).slice(-2),
        s = ("00" + e.getMinutes()).slice(-2),
        v = (e.getSeconds()),
        i = t + "-" + o + "-" + n + "_" + r + "-" + s + "-" +v;
    return i;
}

