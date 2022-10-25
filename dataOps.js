const mongoose = require("mongoose");

//Load the models
const SpecialOrder = require("./models/SpecialOrder");

//Conntect to db
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

const createTipField = async () => {
	try {
		await SpecialOrder.updateMany({}, { $set: { "orderTotals.tip": 0 } });
		console.log("Added tip field to all orders");
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

if (process.argv[2] === "-tips") {
	createTipField();
}
