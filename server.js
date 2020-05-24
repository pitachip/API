const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");

//routes
const specialOrder = require("./routes/specialOrder");
const test = require("./routes/test");
const inventory = require("./routes/inventory");

//load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to mongo
connectDB();

const app = express();

//Body Parser
app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan());
}

//Mount Routers
app.use("/api/v1/", test);
app.use("/api/v1/specialorder", specialOrder);
app.use("/api/v1/inventory", inventory);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
	)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.bold.red);
});
