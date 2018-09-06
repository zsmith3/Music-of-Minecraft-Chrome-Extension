// Functions to handle music playing

// Constants
var STATE_PLAYING = 0,
	STATE_PAUSED = 1,
	STATE_ENDED = 2,
	STATE_WAITING = 3;


// Play a track
function playTrack (track) {
	audioPlayer.src = chrome.extension.getURL(audioRoot + track);
}

// Get the current state of the music player
function getPlayingState () {
	if (Date.now() < lastTrackTimeoutEnd) return STATE_WAITING;
	else if (!audioPlayer.src || audioPlayer.ended) return STATE_ENDED;
	else if (audioPlayer.paused) return STATE_PAUSED;
	else return STATE_PLAYING;
}

// Select the next track to play
function chooseTrack () {
	nextIndex = lastPlayedIndex;
	while (nextIndex == lastPlayedIndex) nextIndex = Math.floor(Math.random() * tracks.length);
	lastPlayedIndex = nextIndex;
	return tracks[nextIndex];
}

// Select and play the next track
function playNextTrack () {
	if (getPlayingState() == STATE_WAITING) return;

	var nextTrack = chooseTrack();
	var timeout = Math.ceil(Math.random() * maxTrackTimeout);
	lastTrackTimeout = setTimeout(function () {
		playTrack(nextTrack);
	}, timeout);
	lastTrackTimeoutEnd = Date.now() + timeout;
}

// Play/resume music
function playMusic () {
	var state = getPlayingState();
	switch (state) {
	case STATE_PAUSED:
		audioPlayer.play();
		break;
	case STATE_ENDED:
		playNextTrack();
		break;
	}

	updateBadge();
}

// Pause music
function pauseMusic () {
	var state = getPlayingState();
	switch (state) {
	case STATE_WAITING:
		if (lastTrackTimeout !== null) clearTimeout(lastTrackTimeout);
		lastTrackTimeout = null;
		lastTrackTimeoutEnd = -1;
		break;
	case STATE_PLAYING:
		audioPlayer.pause();
		break;
	}

	updateBadge();
}

// Toggle (play/pause) the music
function toggleMusic () {
	var state = getPlayingState();
	switch (state) {
	case STATE_PAUSED, STATE_ENDED:
		playMusic();
		break;
	case STATE_PLAYING, STATE_WAITING:
		pauseMusic();
		break;
	}
}

// Update the badge (chrome.browserAction)
function updateBadge () {
	var state = getPlayingState();
	switch (state) {
	case STATE_PLAYING, STATE_WAITING:
		chrome.browserAction.setTitle({title: "Minecraft Background Music Player (active)"});
		chrome.browserAction.setBadgeText({text: "❚❚"});
		chrome.browserAction.setBadgeBackgroundColor({color: "#00AA00"});
		break;
	case STATE_PAUSED, STATE_ENDED:
		chrome.browserAction.setTitle({title: "Minecraft Background Music Player (paused)"});
		chrome.browserAction.setBadgeText({text: "▶"});
		chrome.browserAction.setBadgeBackgroundColor({color: "#AA0000"});
		break;
	}
}
