// Functions to handle music playing

// Constants
var STATE_PLAYING = 1,
	STATE_PAUSED = 2,
	STATE_ENDED = 3,
	STATE_WAITING = 4;

var currentSongName = "";

// Play a track
function playTrack(trackFilePath) {
    // Extract the song name from the file path
    var match = trackFilePath.match(/\/([^/]+)\.(flac|mp4|m4a|mp3|ogv|ogm|ogg|oga|opus|webm|wav)$/i);
    if (match && match.length === 3) {
        var trackName = match[1]; // Extracted song name

        var track = {
            name: trackName
        };

        readFilePath(trackFilePath, "readAsDataURL").then(function (base64) {
            audioPlayer.src = base64;
            currentSongName = track.name; // Set the current song name
            updateBadge(); // Update the badge immediately after setting the song name
        }).catch(function (error) {
            console.error("Error playing track:", error);
        });
    } else {
        console.error("Invalid track file path:", trackFilePath);
    }
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
		getOption("maxTrackTimeout").then(function (maxTrackTimeout) {
			chooseTrack().then(function (nextTrack) {
				var timeout = Math.ceil(Math.random() * maxTrackTimeout * 1000);
				lastTrackTimeout = setTimeout(function () {
					playTrack(nextTrack);
				}, timeout);
				lastTrackTimeoutEnd = Date.now() + timeout;
				resolve();
			}).catch(reject);
		});
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
function updateBadge() {
    var state = getPlayingState();
    var badgeText = "";
    var badgeTitle = "";

    switch (state) {
        case STATE_PLAYING:
        case STATE_WAITING:
            badgeText = "❚❚";
            badgeTitle = "Music of Minecraft - Now Playing: " + currentSongName; // Include current song name
            break;
        case STATE_PAUSED:
        case STATE_ENDED:
            badgeText = "▶";
            badgeTitle = "Music of Minecraft Extension (paused)";
            break;
    }

    chrome.browserAction.setTitle({ title: badgeTitle });
    chrome.browserAction.setBadgeText({ text: badgeText });
    chrome.browserAction.setBadgeBackgroundColor({ color: state === STATE_PLAYING || state === STATE_WAITING ? "#00AA00" : "#AA0000" });
}

