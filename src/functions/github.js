const { errConsole, sysConsole, okConsole, clearConsole } = require("./console");
const { colors, white } = require("./../utils/constantes");
const { spawn } = require("child_process");
const https = require("https");
const fs = require("fs");

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
	const version = "1.0.0"
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


// ---- export ----
module.exports = {
	githubContent,
	update
}