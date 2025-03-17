

// ---- colors ----
const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
	lightRed: "\x1b[91m",
	lightGreen: "\x1b[92m",
	lightYellow: "\x1b[93m",
	lightBlue: "\x1b[94m",
	lightMagenta: "\x1b[95m",
	lightCyan: "\x1b[96m"
};

const white = "\x1b[0m";


// ---- files ----
const files = [
	{
		name: "settings/settings.json",
		content: JSON.stringify({
			"token": "",
			"panel": {
				"color": "",
				"style": ""
			},
			"discord": {
				"style": ""
			}
		})
	},
	{
		name: "logs"
	}
]

// ---- export ----
module.exports = {
	colors,
	white,
	files
};