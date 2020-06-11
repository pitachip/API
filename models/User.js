const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	firebaseUserId: {
		type: String,
		required: [true, "Firebase ID is required"],
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	stripeCustomerId: String,
	taxExemptId: String,
	metaData: Object,
});

module.exports = mongoose.model("User", UserSchema);
