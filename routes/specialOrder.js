const express = require("express");
const {
	getSpecialOrders,
	getSpecialOrder,
	updateSpecialOrder,
	deleteSpecialOrder,
	createSpecialOrder,
} = require("../controllers/specialOrder");
const router = express.Router();

//Route protection
/**
 * Routes that have this middleware can only be accessed by
 * logged in users
 */
const { protect, authorize } = require("../middleware/auth");

//Middleware for advanced querying -- have to bring in model
const SpecialOrder = require("../models//SpecialOrder");
const advancedResults = require("../middleware/advancedResults");

router
	.route("/")
	.get(
		protect,
		authorize("admin", "manager", "customer"),
		advancedResults(SpecialOrder),
		getSpecialOrders
	)
	.post(createSpecialOrder);

router
	.route("/:id")
	.get(getSpecialOrder)
	.put(updateSpecialOrder)
	.delete(deleteSpecialOrder);

module.exports = router;
