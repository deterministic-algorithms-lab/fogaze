/*
"use strict";

function dataURLtoBlob(e) {
    for (var t = e.split(","), o = t[0].match(/:(.*?);/)[1], n = atob(t[1]), r = n.length, s = new Uint8Array(r); r--;) s[r] = n.charCodeAt(r);
    return new Blob([s], {
        type: o
    })
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

function asksForAuthToken() {
    return console.log("get auth token interactively"), new Promise(function(e, t) {
        chrome.identity.getAuthToken({
            interactive: !0
        }, function(o) {
            o ? e(o) : t()
        })
    })
}

function getShortUrl(e, t) {
    return console.log("URL Shortener: get short url"), new Promise(function(o, n) {
        var r = {
                longUrl: t
            },
            s = new XMLHttpRequest;
        s.open("POST", "https://www.googleapis.com/urlshortener/v1/url", !0), s.setRequestHeader("Authorization", "Bearer " + e), s.setRequestHeader("Content-Type", "application/json"), s.onload = function(e) {
            if (200 == e.target.status || 201 == e.target.status) {
                console.log("URL Shortener: success");
                var t = JSON.parse(e.target.response),
                    r = t.id;
                o(r)
            } else console.log("URL Shortener: error"), console.log(e.target.response), n()
        }, s.onerror = function(e) {
            console.log("URL Shortener: error"), console.log(e.target.response), n()
        }, s.send(JSON.stringify(r))
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

function startRecord() {
    console.log("start record"), isRunningRecord() || asksForAuthToken().then(function(e) {
        console.log("user approved auth token");
        var t = new DriveService({
            token: e
        });
        t.getFolderId().then(function(e) {
            videosFolderId = e, isRunning = !0, console.log("starting recording"), chrome.windows.getCurrent({}, function(e) {
                var t = e.width,
                    o = e.height,
                    n = t - CAMERA_WINDOW_WIDTH - 24,
                    r = o - CAMERA_WINDOW_HEIGHT;
                chrome.windows.create({
                    url: "camera.html",
                    type: "popup",
                    width: CAMERA_WINDOW_WIDTH,
                    height: CAMERA_WINDOW_HEIGHT + 140,
                    top: r,
                    left: n
                }, function(e) {
                    cameraWindow = e
                })
            })
        })["catch"](function(e) {
            console.log(e)
        })
    })["catch"](function(e) {
        console.log("user did not approve auth token")
    })
}

function stopRecord() {
    isRunningRecord() && (chrome.runtime.sendMessage({
        id: "stop-recording"
    }), isRunning = !1, console.log("Record was stopped"))
}

function isRunningRecord() {
    return isRunning
}

function manualCapture() {
    isRunningTimer().then(function(e) {
        e && (console.log("manual capture"), takeScreenShot())
    })
}

function uploadData(e) {
    chrome.identity.getAuthToken({
        interactive: !1
    }, function(t) {
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
    e.open("PUT", this.url, !0), e.setRequestHeader("Content-Range", "bytes * /" + this.file.size), e.setRequestHeader("X-Upload-Content-Type", this.file.type), e.upload && e.upload.addEventListener("progress", this.onProgress), e.onload = this.onContentUploadSuccess_.bind(this), e.onerror = this.onContentUploadError_.bind(this), e.send()
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

// --------Dashboard Functions---------//
function currentTab (){
    // chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    //     console.log(tabs[0].url);
    // });
    chrome.browserAction.onClicked.addListener(function(e){
        console.log(e.url); 
        //give you the url of the tab on which you clicked the extension
   })
}





//-----------------------------Visited sites-----------//
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-45267314-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function clearStats() {
  if (config.clearStatsInterval < 3600) {
    config.nextTimeToClear = 0;
    return;
  }

  if (!config.nextTimeToClear) {
    var d = new Date();
    d.setTime(d.getTime() + config.clearStatsInterval * 1000);
    d.setMinutes(0);
    d.setSeconds(0);
    if (config.clearStatsInterval > 3600) {
      d.setHours(0);
    }
    config.nextTimeToClear = d.getTime();
  }
  var now = new Date();
  if (now.getTime() > config.nextTimeToClear) {
    sites.clear();
    var nextTimeToClear = new Date(nextTimeToClear + config.clearStatsInterval * 1000);
    config.nextTimeToClear = nextTimeToClear.getTime();
    return;
  }
}

var config = new Config();
var sites = new Sites(config);
var tracker = new Tracker(config, sites);

/* Listen for requests which come from the user through the popup. */
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "clearStats") {
      sites.clear();
      sendResponse({});
    } else if (request.action == "addIgnoredSite") {
      config.addIgnoredSite(request.site);
      sendResponse({});
    } else {
      console.log("Invalid action given: " + request.action);
    }
  });

chrome.alarms.create("clearStats", {periodInMinutes: 2});
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name == "clearStats") {
    clearStats(config);
  }
});
