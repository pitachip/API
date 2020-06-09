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
	//You can add things like customer address and phone number
});

module.exports = mongoose.model("User", UserSchema);
