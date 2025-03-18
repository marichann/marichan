

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
		name: "logs/user.log",
		content: ""
	},
	{
		name: "logs/error.log",
		content: ""
	},
	{
		name: "storage/backups.json",
		content: JSON.stringify({})
	},
	{
		name: "storage/users.json",
		content: JSON.stringify({})
	}
]

// ---- export ----
module.exports = {
	files
};