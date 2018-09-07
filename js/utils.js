// Promise-based wrapper for chrome.storage.local.get()
function getOption (name) {
	return new Promise(function (resolve, reject) {
		chrome.storage.local.get(name, function (result) {
			resolve(result[name]);
		});
	});
}

// Chain-execute a set of Promise-based functions
function promiseChain (list, callback, result) {
	// TODO figure out error-catching with this
	var done = 0;
	var finalPromise = list.reduce(function (promiseChain, item) {
		return promiseChain.then(function (accumulator) {
			if (finalPromise.onbeforeprogress) finalPromise.onbeforeprogress({item: item, result: accumulator, doneCount: done, totalCount: list.length});
			return new Promise(function (resolve, reject) {
				callback(function (data) {
					done++;
					if (finalPromise.onafterprogress) finalPromise.onafterprogress({item: item, result: data, doneCount: done, totalCount: list.length});
					resolve(data);
				}, reject, item, accumulator);
			});
		});
	}, Promise.resolve(result));
	return finalPromise;
}
