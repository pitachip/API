const express = require("express");
const dotenv = require("dotenv");

//routes
const specialOrder = require("./routes/specialOrder");
const test = require("./routes/test");

//load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();

//Mount Routers
app.use("/api/v1/", test);
app.use("/api/v1/specialorder", specialOrder);

const PORT = process.env.PORT || 5000;

app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
