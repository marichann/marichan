

// ---- restart ----
async function restart(client) {
	sysConsole("Restarting.")
	await client.destroy();
	const index = process.argv[1];
	const args = process.argv.slice(2);
	const proc = spawn('node', [index, ...args], {
		stdio: 'inherit'
	});
	proc.on('close', (code) => {
		process.exit(code);
	});
}


// ---- clear intervalles ----
function stopInterval(intervals, name) {
	const i = intervals.findIndex(i => i.name === name);
	if (i !== -1) {
		clearInterval(intervals[i].interval);
		intervals.splice(i, 1);
	}
}


// ---- export ----
module.exports = {
	restart,
	stopInterval
}