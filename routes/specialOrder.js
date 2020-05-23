const express = require("express");
const {
	getSpecialOrders,
	getSpecialOrder,
	updateSpecialOrder,
	deleteSpecialOrder,
	createSpecialOrder,
} = require("../controllers/specialOrder");
const router = express.Router();

router.route("/").get(getSpecialOrders).post(createSpecialOrder);

router
	.route("/:id")
	.get(getSpecialOrder)
	.put(updateSpecialOrder)
	.delete(deleteSpecialOrder);

module.exports = router;
