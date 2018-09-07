window.onload = function () {
	chrome.runtime.getBackgroundPage(function (page) {
		document.getElementById("message").innerText = "Error: " + page.getTracksError;
	});
};
