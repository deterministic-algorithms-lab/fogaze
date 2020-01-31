var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-45267314-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var config = new Config();
var sites = new Sites(config);

function updateClearStatsInterval() {
  var select = document.getElementById("clear_stats_interval");
  var option = select.options[select.selectedIndex];
  config.clearStatsInterval = option.value;
  // TODO(nav): Set nextTimeToClear in Config
  restoreOptions();
}

function updateTimeDisplay() {
  var select = document.getElementById("time_display");
  var option = select.options[select.selectedIndex];
  config.timeDisplayFormat = option.value;
  restoreOptions();
}

function addIgnoredSite() {
  var newSite = document.getElementById("new_ignored_site").value;
  if (newSite.indexOf("http://") != 0 &&
      newSite.indexOf("https://") != 0) {
    alert("Include http:// or https:// prefix.");
    return;
  }

  chrome.extension.sendRequest(
     {action: "addIgnoredSite", site: newSite},
     function(response) {
       restoreOptions();
     });
}

function removeIgnoredSites() {
  var select = document.getElementById("ignored_sites");
  var ignoredSites = [];
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.selected == false) {
      ignoredSites.push(child.value);
    }
  }
  localStorage['ignoredSites'] = JSON.stringify(ignoredSites);
  restoreOptions();
}

// Restores options from localStorage, if available.
function restoreOptions() {
  var ignoredSites = localStorage['ignoredSites'];
  if (!ignoredSites) {
    return;
  }
  ignoredSites = JSON.parse(ignoredSites);
  var select = document.getElementById("ignored_sites");
  select.options.length = 0;
  for (var i in ignoredSites) {
    var option = document.createElement("option");
    option.text = ignoredSites[i];
    option.value = ignoredSites[i];
    select.appendChild(option);
  }

  var clearStatsInterval = config.clearStatsInterval;
  select = document.getElementById("clear_stats_interval");
  for (var i = 0; i < select.options.length; i++) {
    var option = select.options[i];
    if (option.value == clearStatsInterval) {
      option.selected = true;
      break;
    }
  }

  var timeDisplay = config.timeDisplayFormat;
  select = document.getElementById("time_display");
  for (var i = 0; i < select.options.length; i++) {
    var option = select.options[i];
    if (option.value == timeDisplay) {
      option.selected = true;
      break;
    }
  }
}

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

//Timer for peiodic uploads
var time=0;

function download() {
  var csvContent = "data:text/csv;charset=utf-8,";
  var sitesDict = sites.sites;
  var pairs = [];
  var dict={}
  for (var site in sitesDict) {
    if (sitesDict.hasOwnProperty(site)) {
      pairs.push(site + "," + sitesDict[site]);
      dict[site]=sitesDict[site];
    }
  }
  csvContent += pairs.join("\n");
  window.open(encodeURI(csvContent));
  
//  for (index = 0; index < pairs.length; index++){
    db.collection("tracking_test").add({
//      url: pairs[index].split(",")[0],
//      time: parseFloat(pairs[index].split(",")[1])
        // url:pairs.split(",")[0],
        // time:parseFloat(pairs.split(",")[1])
        url:dict[0],
        time:dict[1],
        uploading_time:getTimestamp()
    })
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
//  }

}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("add_ignored").addEventListener(
    "click", addIgnoredSite);
  document.getElementById("remove_ignored").addEventListener(
    "click", removeIgnoredSites);
  document.getElementById("clear_stats_interval").addEventListener(
    "change", updateClearStatsInterval);
  document.getElementById("time_display").addEventListener(
    "change", updateTimeDisplay);
  document.getElementById("download").addEventListener(
    "click", download);
  restoreOptions();
});

