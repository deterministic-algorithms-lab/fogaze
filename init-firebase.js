var firebaseConfig = {
apiKey: "AIzaSyAo6HbDZI4eq1z6OEQzR0OYStcgImDuL9A",
    authDomain: "fogaze-rx.firebaseapp.com",
    databaseURL: "https://fogaze-rx.firebaseio.com",
    projectId: "fogaze-rx",
    storageBucket: "fogaze-rx.appspot.com",
    messagingSenderId: "761259327124",
    appId: "1:761259327124:web:acab8aa284aba9e0e03e81",
    measurementId: "G-B26C3C66G0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

var database = firebase.database();
var db = firebase.firestore();

var start=document.querySelector('#start');

start.onclick = function start() {
        firebase.database().ref('/').update({start:"Y"}, function (error) {
                if (error) {
                        console.log("The write failed...");
                } else {
                        console.log("VIdeo Playing:True")
                }
        });
}

var stop=document.querySelector('#stop');
stop.onclick = function stop() {
        firebase.database().ref('/').update({start:"N"}, function (error) {
                if (error) {
                        console.log("The write failed...");
                } else {
                        console.log("Video playing:False")
                }
        });
}
