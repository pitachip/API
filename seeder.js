const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");

//Load the models
const SpecialOrder = require("./models/SpecialOrder");
const User = require("./models/User");

//Conntect to db
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

//Read JSON files
const specialOrders = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/specialorders.json`, "utf-8")
);
const users = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

//Import data into db
const importData = async () => {
	try {
		await SpecialOrder.create(specialOrders);
		await User.create(users);
		console.log("Data imported".green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

//Delete data
const deleteData = async () => {
	try {
		await SpecialOrder.deleteMany();
		await User.deleteMany();
		console.log("Data deleted".red.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

if (process.argv[2] === "-i") {
	importData();
} else if (process.argv[2] === "-d") {
	deleteData();
}
