const express = require("express");
const {
	getInventoryItem,
	getInventory,
	deleteInventoryItem,
	updateInventoryItem,
	createInventoryItem,
} = require("../controllers/inventory");
const router = express.Router();

router.route("/").get(getInventory).post(createInventoryItem);

router
	.route("/:id")
	.get(getInventoryItem)
	.put(updateInventoryItem)
	.delete(deleteInventoryItem);

module.exports = router;
