const path = require("path");
const fs = require("fs");
const { colors, white } = require("./../utils/constantes");

// ---- time ----
class Time {
	constructor(timestamp) {
		this.timestamp = timestamp || Date.now();
		this.date = new Date(timestamp);
	}

	format() {
		const hours = this.date.getHours();
		const minutes = this.date.getMinutes();
		const seconds = this.date.getSeconds();
		const day = this.date.getDate();
		const month = this.date.getMonth() + 1;
		const year = this.date.getFullYear();

		return {
			hours: hours < 10 ? `0${hours}` : hours,
			minutes: minutes < 10 ? `0${minutes}` : minutes,
			seconds: seconds < 10 ? `0${seconds}` : seconds,
			day: day < 10 ? `0${day}` : day,
			year: year
		};
	}
}


// ---- color ----
function color() {
	const settings = require("./../../data/config/settings.json");

	const random = Object.values(colors)[Math.floor(Math.random() * Object.values(colors).length)];

	if (Object.keys(colors).map(k => k.toLowerCase()).includes(settings.panel.color.toLowerCase()))
		return colors[Object.keys(colors).find(k => k.toLowerCase() === settings.panel.color.toLowerCase())];
	else
		return random;
	// const color = settings.panel.color ? null : color();
	// ${color ? color : color()}
}


// ---- console.log ----
function formatedHours(){
	const now = new Time(Date.now());
	const formated = now.format();
	return `${formated.hours}:${formated.minutes}:${formated.seconds}`;
}

function okConsole(text) {
	process.stdout.write(`[${colors.green}${formatedHours()}${white}] [${colors.green}+${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log'), `${formatedHours()} | OK | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function sysConsole(text) {
	process.stdout.write(`[${colors.cyan}${formatedHours()}${white}] [${colors.cyan}*${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log'), `${formatedHours()} | SYSTEM | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function errConsole(text) {
	process.stdout.write(`[${colors.red}${formatedHours()}${white}] [${colors.red}-${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log'), `${formatedHours()} | ERROR | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function logConsole(text) {
	process.stdout.write(`${text}\n`);
	if (fs.existsSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, '..', '..', 'data', 'logs', 'console.log'), `${formatedHours()} | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function clearConsole() {
	process.stdout.write("\x1Bc");
}


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


// ---- export ----
module.exports = {
	Time,
	color,
	sysConsole,
	okConsole,
	errConsole,
	question,
	logConsole,
	clearConsole
}