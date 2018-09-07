// Get the current value of an input
function getValue (input) {
	switch (input.type) {
	case "checkbox":
	case "radio":
		return input.checked;
	case "file":
		return input.files;
	default:
		return input.value;
	}
}

// Set the current value of an input
function setValue (input, value) {
	switch (input.type) {
	case "checkbox":
	case "radio":
		input.checked = value;
		break;
	default:
		input.value = value;
		break;
	}
}

// Enable/disable fieldsets
function updateFSDisabled (name, value) {
	var fieldSet = document.getElementById("fieldset-" + name);
	if (fieldSet) {
		if (value) fieldSet.removeAttribute("disabled");
		else fieldSet.setAttribute("disabled", "true");
	}
}

// Update an option
function updateOption (input, nosave, isNamed) {
	if (input.name && !isNamed) {
		var allInputs = document.querySelectorAll("[name=" + input.name + "]");
		for (var i = 0; i < allInputs.length; i++) updateOption(allInputs[i], nosave, true);
		return;
	}

	var name;
	if (input.id.startsWith("input-nosave")) name = input.id.substr(13);
	else name = input.id.substr(6);
	var value = getValue(input);

	if (input.type == "radio") updateFSDisabled(name, value);

	if (!nosave) chrome.storage.local.set({[name]: value});

	if (name in optionSetFunctions) optionSetFunctions[name](value);
}

// Pre-fill an option
function fillOption (input) {
	var name;
	if (input.id.startsWith("input-nosave")) name = input.id.substr(13);
	else name = input.id.substr(6);

	if (name in optionGetFunctions) optionGetFunctions[name](input);
	else {
		getOption(name).then(function (result) {
			if (input.type == "radio") updateFSDisabled(name, result);

			setValue(input, result);
		});
	}
}

// Add input onchange listeners
window.onload = function () {
	var inputs = document.querySelectorAll("input");
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].id.startsWith("input")) {
			inputs[i].onchange = function () { updateOption(this, this.id.startsWith("input-nosave")); };
			fillOption(inputs[i]);
		}
	}
};

// Custom functions to pre-fill options
var optionGetFunctions = {
	mcFolder: function (input) {
		getOption("mcMusicFiles").then(function (result) {
			if (result.length) {
				input.labels[0].innerText = result.length + " music files selected";
				document.querySelector(".progress-bar").style.width = "100%";
			}
		});
	}
};

// Functions to run after updating options
var optionSetFunctions = {
	volume: function (value) {
		chrome.runtime.getBackgroundPage(function (page) {
			page.updateVolume(value);
		});
	},
	mcFolder: function (files) {
		extractMCMusicFiles(files, function (progress) {
			document.querySelector(".progress-bar").style.width = (progress * 100) + "%";
		}).then(function (files) {
			chrome.storage.local.set({mcMusicFiles: files}, function () {
				document.getElementById("mcFolder-status").innerText = "Successfully copied and set music files.";
				chrome.runtime.getBackgroundPage(function (page) {
					page.updateBrowserAction();
				});
			});
		}).catch(function (error) {
			console.error(error);
			document.getElementById("mcFolder-status").innerText = "An error occurred: " + error;
		});
	}
};
