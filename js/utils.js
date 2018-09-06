// Promise-based wrapper for chrome.storage.local.get()
function getOption (name) {
	return new Promise(function (resolve, reject) {
		chrome.storage.local.get(name, function (result) {
			resolve(result[name]);
		});
	});
}
