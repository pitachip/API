const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	firebaseUserId: {
		type: String,
		required: [true, "Firebase ID is required"],
		unique: true,
	},
	stripeCustomerId: String,
	taxExemptId: String,
	//You can add things like customer address and phone number
});

module.exports = mongoose.model("User", UserSchema);
