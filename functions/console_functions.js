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


// ---- export ----
module.exports = {
	Time
}