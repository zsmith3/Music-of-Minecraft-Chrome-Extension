// Functions to handle music playing

// Play a track
function playTrack (track) {
	audioPlayer.src = chrome.extension.getURL(audioRoot + track);
}

// Select the next track to play
function chooseTrack () {
	nextIndex = lastPlayedIndex;
	while (nextIndex == lastPlayedIndex) {
		nextIndex = Math.floor(Math.random() * tracks.length);
	}

	lastPlayedIndex = nextIndex;

	return tracks[nextIndex];
}

// Select and play the next track
function playNextTrack () {
	// TODO set random timeout (up to e.g. 3 mins) here (i think)

	var nextTrack = chooseTrack();
	playTrack(nextTrack);
}

// Play/resume music
function playMusic () {
	if (!audioPlayer.src || audioPlayer.ended) {
		playNextTrack();
	} else if (audioPlayer.src && audioPlayer.paused) {
		audioPlayer.play();
	}
}

// Pause music
function pauseMusic () {
	if (audioPlayer.src && !audioPlayer.paused) {
		audioPlayer.pause();
	}
}
