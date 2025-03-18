const fs = require("fs");
const https = require("https");
const { exec } = require("child_process");
const readline = require("readline");
const path = require("path");
const os = require("os");
const util = require("util");


// ---- node functions ----
const execPromise = util.promisify(exec);


// ---- version ----
const version = "1.0.0";

// ---- start function ----
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


// ---- console.log ----
function formatedHours() {
	const now = new Time(Date.now());
	const formated = now.format();
	return `${formated.hours}:${formated.minutes}:${formated.seconds}`;
}

function okConsole(text) {
	process.stdout.write(`[${colors.green}${formatedHours()}${white}] [${colors.green}+${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'console.log'), `${formatedHours()} | OK | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function sysConsole(text) {
	process.stdout.write(`[${colors.cyan}${formatedHours()}${white}] [${colors.cyan}*${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'console.log'), `${formatedHours()} | SYSTEM | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function errConsole(text) {
	process.stdout.write(`[${colors.red}${formatedHours()}${white}] [${colors.red}-${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'console.log'), `${formatedHours()} | ERROR | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function logConsole(text) {
	process.stdout.write(`${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'console.log'), `${formatedHours()} | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function clearConsole() {
	process.stdout.write("\x1Bc");
}


// ---- get content files ----
function githubContent(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
			let data = '';
			if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				https.get(`${url}/${response.headers.location}`, (res) => {
					if (res.statusCode == 200) {
						res.on("data", (chunck) => data += chunck);
						res.on("end", () => resolve(data));
					} else
						reject(errConsole(`${colors.red}${res.statusCode}${white}: ${res.statusMessage}`));
				}).on("error", reject);
			} else if (response.statusCode == 200) {
				response.on("data", (chunck) => data += chunck);
				response.on("end", () => resolve(data));
			} else
				reject(errConsole(`${colors.red}${response.statusCode}${white}: ${response.statusMessage}`));
		}).on("error", reject);
	})
}


// ---- check all files ----
async function checkFiles() {
	const paths = [
		".gitignore",
		"package.json",
		"README.md",
		"src/console.js",
		"src/constantes.js",
		"src/utils.js"
	]
	
	try {
		await Promise.all(paths.map(file => fs.promises.access(file)));
		return true;
	} catch (e) {
		return false;
	}
}

// ---- update files ----
function cleanDir() {
	const files = fs.readdirSync(__dirname);
	for (const f of files) {
		if (f !== '.git') {
			const fPath = path.join(__dirname, f);
			fs.rmSync(fPath, { recursive: true, force: true });
		}
	}
}

async function update() {
	const check = await checkFiles();
	const url = "https://github.com/marichann/marichan";
	const gitVersion = JSON.parse(await githubContent("https://raw.githubusercontent.com/marichann/marichan/refs/heads/main/version.json"))
	if (!fs.existsSync('.git')) {
		sysConsole("Updating files.")
		await cleanDir();
		try {
			await execPromise(`git clone ${url} .`);
			okConsole("files cloned.");
		} catch (e) {
			errConsole(`Error cloning: ${e}`);
		}
	} else if (version === gitVersion.version && fs.existsSync('./package.json') && check) {
		sysConsole("No update.");
	}
	else {
		sysConsole("Updating files.")
		try {
			await execPromise('git reset --hard');
			await execPromise('git pull origin main');
			okConsole("files updated.");
		} catch (e) {
			errConsole(`Error updating: ${e}`);
		}
	}
}


// ---- global constantes ----
const intervals = [];


// ---- start ----
update();

module.exports = {
	Time,
	colors,
	white
}