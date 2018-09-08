// Functions to handle music playing

// Constants
var STATE_PLAYING = 1,
	STATE_PAUSED = 2,
	STATE_ENDED = 3,
	STATE_WAITING = 4;


// Play a track
function playTrack (track) {
	readFilePath(track, "readAsDataURL").then(function (base64) {
		audioPlayer.src = base64;
	});
}

// Update the music volume
function updateVolume (value) {
	audioPlayer.volume = value;
}

// Get the current state of the music player
function getPlayingState () {
	if (Date.now() < lastTrackTimeoutEnd) return STATE_WAITING;
	else if (!audioPlayer.src || audioPlayer.ended) return STATE_ENDED;
	else if (audioPlayer.paused) return STATE_PAUSED;
	else return STATE_PLAYING;
}

// Get the current track listing
function getAllTracks () {
	return new Promise(function (resolve, reject) {
		function testArr (arr) {
			if (arr.length > 0) resolve(arr);
			else reject("No music selected yet.");
		}

		getOption("musicLocMc").then(function (result) {
			if (result) getOption("mcMusicFiles").then(testArr).catch(reject);
			else getOption("musicLocFolder").then(function (result) {
				if (result) getOption("folderMusicFiles").then(testArr).catch(reject);
				else reject("No music source selected yet.");
			}).catch(reject);
		}).catch(reject);
	});
}

// Select the next track to play
function chooseTrack () {
	return new Promise(function (resolve, reject) {
		getAllTracks().then(function (tracks) {
			nextIndex = lastPlayedIndex;
			while (nextIndex == lastPlayedIndex) nextIndex = Math.floor(Math.random() * tracks.length);
			lastPlayedIndex = nextIndex;
			resolve(tracks[nextIndex]);
		}).catch(reject);
	});
}

// Select and play the next track
function playNextTrack () {
	if (getPlayingState() == STATE_WAITING) return;

	return new Promise(function (resolve, reject) {
		chooseTrack().then(function (nextTrack) {
			var timeout = Math.ceil(Math.random() * maxTrackTimeout);
			lastTrackTimeout = setTimeout(function () {
				playTrack(nextTrack);
			}, timeout);
			lastTrackTimeoutEnd = Date.now() + timeout;
			resolve();
		}).catch(reject);
	});
}

// Play/resume music
function playMusic () {
	var state = getPlayingState();
	switch (state) {
	case STATE_PAUSED:
		audioPlayer.play();
		break;
	case STATE_ENDED:
		playNextTrack().then(updateBadge).catch(console.error);
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
	case STATE_PAUSED:
	case STATE_ENDED:
		playMusic();
		break;
	case STATE_PLAYING:
	case STATE_WAITING:
		pauseMusic();
		break;
	}
}

// Update the badge (chrome.browserAction)
function updateBadge () {
	var state = getPlayingState();
	switch (state) {
	case STATE_PLAYING:
	case STATE_WAITING:
		chrome.browserAction.setTitle({title: "Music of Minecraft Extension (active)"});
		chrome.browserAction.setBadgeText({text: "❚❚"});
		chrome.browserAction.setBadgeBackgroundColor({color: "#00AA00"});
		break;
	case STATE_PAUSED:
	case STATE_ENDED:
		chrome.browserAction.setTitle({title: "Music of Minecraft Extension (paused)"});
		chrome.browserAction.setBadgeText({text: "▶"});
		chrome.browserAction.setBadgeBackgroundColor({color: "#AA0000"});
		break;
	}
}
