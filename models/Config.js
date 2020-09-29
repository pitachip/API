const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
	type: {
		type: String,
		required: [true, "Config Type is Required"],
	},
	settings: {},
});

module.exports = mongoose.model("Config", ConfigSchema);
