// The main (background) script

// Initialize extension (on install)
chrome.runtime.onInstalled.addListener(function () {
	// nothing here
});

// Initialize background data (on chrome open)
function initialize () {
	audioPlayer = document.createElement("audio");
	audioPlayer.autoplay = true;
	getOption("volume").then(updateVolume);
	audioPlayer.onended = function () {
		playNextTrack();
	};

	getOption("onstart").then(function (value) {
		if (value) playMusic();
		else updateBadge();
	});
}

// Play/pause music (on extension badge click)
chrome.browserAction.onClicked.addListener(function (tab) {
	toggleMusic();
});


// Global constants
var audioRoot = "audio/";
var tracks = ["clip1.mp3", "clip2.mp3", "clip3.mp3", "clip4.mp3"];
var maxTrackTimeout = 3 * 60 * 1000;

// Global variables
var audioPlayer;
var lastPlayedIndex = -1;
var lastTrackTimeout;
var lastTrackTimeoutEnd = -1;


// Run initialization
initialize();
