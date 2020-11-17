const fs = require("fs");
const mongoose = require("mongoose");
var AutoIncrement = require("mongoose-sequence")(mongoose);
const colors = require("colors");

//Load the models
const SpecialOrder = require("./models/SpecialOrder");
const User = require("./models/User");
const Menu = require("./models/Menu");
const Config = require("./models/Config");

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

const menu = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/menu.json`, "utf-8")
);

const config = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/config.json`, "utf-8")
);

//Import data into db for dev and local
const importData = async () => {
	try {
		await SpecialOrder.create(specialOrders);
		await User.create(users);
		await Menu.create(menu);
		await Config.create(config);
		console.log("Data imported".green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

//Delete data for dev and local
const deleteData = async () => {
	try {
		await SpecialOrder.deleteMany();
		await SpecialOrder.counterReset("ordeNumberSequencer", function (err) {
			console.log("Error Reseting Counter: ", err);
		});
		await User.deleteMany();
		await Menu.deleteMany();
		await Config.deleteMany();
		console.log("Data deleted".red.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

const seedProdData = async () => {
	try {
		await Menu.create(menu);
		await Config.create(config);
		console.log("Data imported".green.inverse);
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const deleteProdData = async () => {
	try {
		await Menu.deleteMany();
		await Config.deleteMany();
		console.log("Data deleted".red.inverse);
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

if (process.argv[2] === "-i") {
	importData();
} else if (process.argv[2] === "-d") {
	deleteData();
} else if (process.argv[2] === "-seedProd") {
	seedProdData();
} else if (process.argv[2] === "-deleteProd") {
	deleteProdData();
}
