const express = require("express");
const { getMenu, updateMenu } = require("../controllers/menu");
const router = express.Router();

//Route protection
/**
 * Routes that have this middleware can only be accessed by
 * logged in users
 */
const { protect, authorize } = require("../middleware/auth");

router.route("/").get(protect, getMenu);

router.route("/:id").put(protect, authorize("admin"), updateMenu);

module.exports = router;
