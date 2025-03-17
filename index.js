const fs = require("fs");
const https = require("https");
const process = require("child_process");
const readline = require("readline");
const path = require("path");
const os = require("os");
const util = require("util");


// ---- node functions ----
const execPromise = util.promisify(process.exec);


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


// ---- console.log ----
function formatedHours() {
	const now = new Time(Date.now());
	const formated = now.format();
	return `${formated.hours}:${formated.minutes}:${formated.seconds}`;
}

function okConsole(text) {
	process.stdout.write(`[${colors.green}${formatedHours()}${white}] [${colors.green}+${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'logs', 'console.log'), `${formatedHours()} | OK | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function sysConsole(text) {
	process.stdout.write(`[${colors.cyan}${formatedHours()}${white}] [${colors.cyan}*${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'logs', 'console.log'), `${formatedHours()} | SYSTEM | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function errConsole(text) {
	process.stdout.write(`[${colors.red}${formatedHours()}${white}] [${colors.red}-${white}] ${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'logs', 'console.log'), `${formatedHours()} | ERROR | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
}

function logConsole(text) {
	process.stdout.write(`${text}\n`);
	if (fs.existsSync(path.join(__dirname, 'data', 'logs', 'console.log')))
		fs.appendFileSync(path.join(__dirname, 'data', 'logs', 'console.log'), `${formatedHours()} | ${text.replace(/\x1B\[[0-9;]*m/g, "")}\n`);
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

function execWithProgress(command) {
	return new Promise((resolve, reject) => {
		const process = spawn(command, { shell: true });

		process.stdout.on("data", (data) => {
			process.stdout.write(data.toString());
		});

		process.stderr.on("data", (data) => {
			process.stderr.write(data.toString());
		});

		process.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(`Process exited with code ${code}`);
			}
		});
	});
}

async function update() {
	const url = "https://github.com/marichann/marichan";
	const gitVersion = JSON.parse(await githubContent("https://raw.githubusercontent.com/marichann/marichan/refs/heads/main/version.json"))
	if (!fs.existsSync('.git')) {
		sysConsole("Updating files.")
		await cleanDir();
		try {
			await execWithProgress(`git clone ${url} .`);
		} catch (e) {
			errConsole(`Error cloning: ${e}`);
		}
	} else if (version === gitVersion.version && fs.existsSync('./package.json')) {
		sysConsole("No update.");
	}
	else {
		sysConsole("Updating files.")
		try {
			await execWithProgress('git reset --hard');
			await execWithProgress('git pull origin main');
		} catch (e) {
			errConsole(`Error updating: ${e}`);
		}
	}
}


// ---- global constantes ----
const intervals = [];


update();
// ---- start ----
