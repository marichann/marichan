

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
	question
}