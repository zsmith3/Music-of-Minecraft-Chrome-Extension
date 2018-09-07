// Functions to handle fetching of music files


// Generic file utils

// Format a file path
function formatPath(path) {
	return path.replace(/\/\//g, "/");
}

// Recursively create directories
function makeDirs (baseDir, newDir) {
	return new Promise (function (resolve, reject) {
		newDir = formatPath("/" + newDir + "/").substr(1);
		if (newDir.length <= 1) {
			resolve(baseDir);
			return;
		}

		var firstDir = newDir.substr(0, newDir.indexOf("/"));
		var otherDirs = newDir.substr(newDir.indexOf("/") + 1);

		baseDir.getDirectory(firstDir, { create: true }, function (dirEntry) {
			makeDirs(dirEntry, otherDirs).then(resolve).catch(reject);
		}, reject);
	});
}

// Write a blob to a file
function writeToFile (fullPath, fileData) {
	var dirPath = fullPath.substr(0, fullPath.lastIndexOf("/"));
	var filePath = fullPath.substr(fullPath.lastIndexOf("/") + 1);
	return new Promise(function (resolve, reject) {
		webkitRequestFileSystem(PERSISTENT, 1024, function (filesystem) {
			makeDirs(filesystem.root, dirPath).then(function (dirEntry) {
				dirEntry.getFile(filePath, { create: true }, function (file) {
					file.createWriter(function (writer) {
						writer.addEventListener("write", function (event) {
							resolve();
						});
						writer.addEventListener("error", reject);
						writer.write(fileData);
					}, reject);
				}, reject);
			});
		}, reject);
	});
}

// Read data from a blob (type = "readAs{datatype}")
function readBlob (blob, type) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		reader.onloadend = function (e) {
			resolve(this.result);
		};
		reader.onerror = reject;
		reader[type](blob);
	});
}

// Read data from a file path
function readFilePath (filePath, type) {
	return new Promise(function (resolve, reject) {
		webkitRequestFileSystem(PERSISTENT, 1024, function (fs) {
			fs.root.getFile(filePath, {}, function (fileEntry) {
				fileEntry.file(function (file) {
					readBlob(file, type).then(resolve).catch(reject);
				}, reject);
			}, reject);
		}, reject);
	});
}


// Minecraft file functions

//  Represent version string as a number (for comparison)
function versionStrToNumber (versionSplit) {
	var total = 0;
	for (var i = 0; i < versionSplit.length; i++) {
		total += parseInt(versionSplit[i]) * Math.pow(10, (versionSplit.length - i) * 3);
	}
	return total;
}

// Get the latest from a list of version strings
function getLatestVersion (allVersions) {
	var splitVersions = allVersions.map(function (v) { return v.split("."); });
	var splitLengths = splitVersions.map(function (v) { return v.length; });
	var maxLength = Math.max(...splitLengths);
	var newVersions = splitVersions.map(function (v) { return v.length == maxLength ? v : v.concat(Array(maxLength - v.length).fill("0")); });
	var versionNumbers = newVersions.map(function (v) { return versionStrToNumber(v); });
	var maxVersion = Math.max(...versionNumbers);
	return allVersions[versionNumbers.indexOf(maxVersion)];
}

// Extract the assets index file from a full set of asset files
function getMCIndexFile (allAssetFiles) {
	var indexFiles = allAssetFiles.filter(function (f) { return f.webkitRelativePath.startsWith("assets/indexes/"); });
	var versions = indexFiles.map(function (f) { return f.name.substr(0, f.name.lastIndexOf(".")); }).filter(function (fn) { return !isNaN(parseInt(fn[0])); });
	if (versions.length <= 0) return null;
	var latestVersion = getLatestVersion(versions);
	var latestFiles = indexFiles.filter(function (f) { return f.name == latestVersion + ".json"; });
	if (latestFiles.length > 0) return latestFiles[0];
	else return null;
}

// Extract music files from a full list of asset files
function extractMCMusicFiles (fileList, progressCallback) {
	var allAssetFiles = Array.from(fileList);
	return new Promise(function (resolve, reject) {
		// Find the latest index file
		var indexFile = getMCIndexFile(allAssetFiles);
		if (indexFile === null) {
			reject("No Minecraft assets index file found");
			return;
		}

		// Read the index file
		readBlob(indexFile, "readAsText").catch(reject).then(function (indexText) {
			// Extract music tracks
			var indexJSON = JSON.parse(indexText).objects;
			var musicFileNames = Object.keys(indexJSON).filter(function (key) { return key.indexOf("music") !== -1; });
			var allTracks = musicFileNames.map(function (path) {
				var files = allAssetFiles.filter(function (f) { return f.name == indexJSON[path].hash; });
				if (files.length == 0) return null;
				return {
					name: path,
					file: files[0]
				};
			}).filter(function (o) { return o !== null; });

			// Copy files to extension directory
			var totalSize = allTracks.reduce(function (total, track) { return total + track.file.size; }, 0);
			var doneSize = 0;
			promiseChain(allTracks, function (resolve, reject, track) {
				writeToFile("mcfiles/" + track.name, track.file).then(function () {
					doneSize += track.file.size;
					progressCallback(doneSize / totalSize);
					resolve();
				}).catch(reject);
			}, null).then(function () {
				var finalFileNames = allTracks.map(function (o) { return "mcfiles/" + o.name; })
				resolve(finalFileNames);
			});
		});
	});
}
