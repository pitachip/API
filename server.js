const express = require("express");
const cors = require("cors");
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
const auth = require("./routes/auth");
const user = require("./routes/user");
const menu = require("./routes/menu");
const config = require("./routes/config");
const payment = require("./routes/payment");

//TODO: might not need that line anymore
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

//cors
var allowedOrigins = [
	"https://dev-specialorder.pitachip.biz",
	"https://specialorder.pitachip.biz",
	"https://dev-backoffice.pitachip.biz",
	"https://backoffice.pitachip.biz",
	"http://localhost:3000",
];
app.use(
	cors({
		origin: function (origin, callback) {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				var msg =
					"The CORS policy for this site does not " +
					"allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	})
);

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
}

//Mount Routers
app.use("/api/v1/", test);
app.use("/api/v1/specialorder", specialOrder);
app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/menu", menu);
app.use("/api/v1/config", config);
app.use("/api/v1/payment", payment);

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
