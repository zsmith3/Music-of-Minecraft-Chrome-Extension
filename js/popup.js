window.onload = function () {
    chrome.runtime.getBackgroundPage(function (page) {
        var errorMessage = document.getElementById("message");
        if (page.getTracksError) {
            errorMessage.innerText = "Error: " + page.getTracksError;
        } else {
            var currentSongElement = document.getElementById("current-song");
            currentSongElement.innerText = "Now Playing: " + page.currentSongName; // Display current song name
        }
    });
};