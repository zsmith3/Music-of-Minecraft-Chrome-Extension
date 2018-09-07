// The main (background) script

// Initialize extension (on install)
chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.local.clear(function () {
		chrome.storage.local.set({
			volume: 1,
			onstart: false,
			musicLocMc: false,
			musicLocFolder: false,
			mcMusicFiles: [],
			folderMusicFiles: []
		}, function () {
			initialize();
		});
	});
});

// Initialize background data (on chrome open)
function initialize () {
	if (initialized) return;
	else initialized = true;

	audioPlayer = document.createElement("audio");
	audioPlayer.autoplay = true;
	getOption("volume").then(updateVolume);
	audioPlayer.onended = function () {
		playNextTrack();
	};

	updateBrowserAction().then(function () {
		getOption("onstart").then(function (value) {
			if (value) playMusic();
			else updateBadge();
		});
	});
}

// Update the browserAction based on whether music is selected
function updateBrowserAction () {
	return new Promise(function (resolve, reject) {
		getAllTracks().then(function () {
			getTracksError = null;
			chrome.browserAction.setPopup({popup: ""});
			updateBadge();
			resolve();
		}).catch(function (error) {
			getTracksError = error;
			chrome.browserAction.setPopup({popup: "html/popup.html"});
			updateBadge();
		});
	});
}

// Play/pause music (on extension badge click)
chrome.browserAction.onClicked.addListener(function (tab) {
	toggleMusic();
});


// Global constants
var maxTrackTimeout = 3 * 60 * 1000;

// Global variables
var audioPlayer;
var lastPlayedIndex = -1;
var lastTrackTimeout;
var lastTrackTimeoutEnd = -1;
var getTracksError;
var initialized = false;


// Run initialization
setTimeout(initialize, 1000);
