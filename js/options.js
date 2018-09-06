// Get the current value of an input
function getValue (input) {
	if (input.type == "checkbox") return input.checked;
	else return input.value;
}

// Set the current value of an input
function setValue (input, value) {
	if (input.type == "checkbox") input.checked = value;
	else input.value = value;
}

// Update an option
function updateOption (input) {
	var name = input.id.substr(6);
	var value = getValue(input);

	chrome.storage.local.set({[name]: value});
}

// Pre-fill an option
function fillOption (input) {
	var name = input.id.substr(6);

	chrome.storage.local.get(name, function (result) {
		setValue(input, result[name]);
	});
}

// Add input onchange listeners
window.onload = function () {
	var inputs = document.querySelectorAll("input");
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].onchange = function () { updateOption(this); };
		fillOption(inputs[i]);
	}
};
