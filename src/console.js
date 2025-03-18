const { colors } = require("./../index");


// ---- readline ----
function question(readline, text, callback = null) {
	let rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	if (callback) {
		rl.question(text, (answer) => {
			rl.close();
			callback(answer);
		});
	} else {
		return new Promise((resolve) => {
			rl.question(text, (answer) => {
				rl.close();
				resolve(answer);
			});
		});
	}
}


// ---- color manager ----
function color() {
	const settings = require("./data/config/settings.json");

	const random = Object.values(colors)[Math.floor(Math.random() * Object.values(colors).length)];

	if (Object.keys(colors).map(k => k.toLowerCase()).includes(settings.panel.color.toLowerCase()))
		return colors[Object.keys(colors).find(k => k.toLowerCase() === settings.panel.color.toLowerCase())];
	else
		return random;
	// const color = settings.panel.color ? null : color();
	// ${color ? color : color()}
}


// ---- export ----
module.exports = {
	question,
	color
}