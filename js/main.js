// The main (background) script

// Initialize extension (on install)
chrome.runtime.onInstalled.addListener(function () {
	// nothing here
});

// Initialize background data (on chrome open)
function initialize () {
	audioPlayer = document.createElement("audio");
	audioPlayer.autoplay = true;
	audioPlayer.onended = function () {
		playNextTrack();
	};
}


// Global variables
var audioPlayer;
var audioRoot = "audio/";
var tracks = ["clip1.mp3", "clip2.mp3", "clip3.mp3", "clip4.mp3"];
var lastPlayedIndex = -1;


// Run initialization
initialize();

/* TODO
set volume with audioPlayer.volume (0 - 1)

*/
