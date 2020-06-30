const Menu = require("../models/Menu");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc     Get menu
//@route    GET /api/v1/menu
//@access   Private - authenticated users
exports.getMenu = asyncHandler(async (req, res, next) => {
	const menu = await Menu.find({ menuType: "Catering" });

	res.status(200).json({
		success: true,
		data: menu[0],
	});
});

//@desc     Update menu
//@route    PUT /api/v1/user
//@access   Private - authenticated users | admins
exports.updateMenu = asyncHandler(async (req, res, next) => {
	/**
	 * This is tricky because the document has so much nesting
	 * I dont really want to create a controller for each part
	 * of the menu. Need to see if I can generalize this
	 * I also dont think we'll be updating this often enough
	 * to justify reference instead of straight embed
	 */

	//TODO: Add some error handling in this method

	const data = req.body;
	const updateMenu = await Menu.findById(req.params.id);

	if (!updateMenu) {
		return next(
			new ErrorResponse(`Menu item with id ${req.params.id} not found`, 401)
		);
	}

	//update category (e.g. lunch boxes)
	if (data.updateCategory) {
		var updateCategory = await updateMenu.categories.id(data.updateCategoryId);
		updateCategory.set(data.updateCategoryData);
		await updateCategory.save({ suppressWarning: true });
	}

	//update menu item (e.g. chicken lunch box)
	if (data.updateMenuItem) {
		var updateMenuItem = await updateMenu.categories
			.id(data.updateCategoryId)
			.items.id(data.updateMenuItemId);
		updateMenuItem.set(data.updateMenuItemData);
		await updateMenuItem.save({ suppressWarning: true });
	}

	//update modifiers (e.g. choose entree)
	if (data.updateMenuItemModifier) {
		var updateMenuItemModifier = await updateMenu.categories
			.id(data.updateCategoryId)
			.items.id(data.updateMenuItemId)
			.modifiers.id(data.updateMenuItemModifierId);
		updateMenuItemModifier.set(data.updateMenuItemModifierData);
		await updateMenuItemModifier.save({ suppressWarning: true });
	}

	//update options in modifiers (e.g. entree choices)
	if (data.updateModifierOption) {
		var updateModifierOptions = await updateMenu.categories
			.id(data.updateCategoryId)
			.items.id(data.updateMenuItemId)
			.modifiers.id(data.updateMenuItemModifierId)
			.options.id(data.updateModifierOptionId);

		updateModifierOptions.set(data.updateModifierOptionData);
		await updateModifierOptions.save({ suppressWarning: true });
	}

	//Save the whole document
	const savedMenu = await updateMenu.save({ suppressWarning: true });

	res.status(200).json({
		success: true,
		data: savedMenu,
	});
});
