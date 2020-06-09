const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const connectFirebaseDb = require("./config/auth-db");
const errorHandler = require("./middleware/error");

//routes
const specialOrder = require("./routes/specialOrder");
const test = require("./routes/test");
const inventory = require("./routes/inventory");
const auth = require("./routes/auth");

//load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to mongo
connectDB();

//Connect to firebase
connectFirebaseDb();

const app = express();

//Body Parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Dev logging middleware
//note that 'development' here really means localhost
if (
	process.env.NODE_ENV === "development" ||
	process.env.NODE_ENV === "localhost"
) {
	app.use(morgan());
	//Gets rid of the annoying CORS error
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "http://localhost:3000");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		return next();
	});
} else {
	//TODO: update this origin list to only be the dev and prod site
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		return next();
	});
}

//Mount Routers
app.use("/api/v1/", test);
app.use("/api/v1/specialorder", specialOrder);
app.use("/api/v1/auth", auth);
app.use("/api/v1/inventory", inventory);

//Mount error handler -- HAS TO BE after routes
app.use(errorHandler);

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
