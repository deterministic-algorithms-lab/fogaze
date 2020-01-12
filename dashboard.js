var PrevTabURL= document.getElementById("PrevTabURL");
var PrevTabTime= document.getElementById("PrevTabTime");

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    // since only one tab should be active and in the current window at once
    // the return variable should only have one entry
    var activeTab = tabs[0];
    var activeTabURL = activeTab.Tab.url; // or do whatever you need
    var activeTabTitle = activeTab.Tab.title;
 });

 console.log(activeTabURL);
 console.log(activeTabTitle);
