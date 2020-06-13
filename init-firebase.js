var firebaseConfig = {
        apiKey: "AIzaSyB2PsbtUCHr2PeP1GVbN9rp0BJE0YxKSdc",
        authDomain: "fogaze-utility.firebaseapp.com",
        databaseURL: "https://fogaze-utility.firebaseio.com",
        projectId: "fogaze-utility",
        storageBucket: "fogaze-utility.appspot.com",
        messagingSenderId: "91425470876",
        appId: "1:91425470876:web:b63a244256e87693dd7059",
        measurementId: "G-XF3YEJJP7X"
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
