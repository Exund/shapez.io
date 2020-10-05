import { DrawParameters } from "../core/draw_parameters";
import { Vector } from "../core/vector";
import { BaseItem } from "../game/base_item";
import { enumColors } from "../game/colors";
import { COLOR_ITEM_SINGLETONS } from "../game/items/color_item";
import { DisplaySystem } from "../game/systems/display";

export class ModItem extends BaseItem {
	/**
	 * @param {any} itemData 
	 * @returns {BaseItem}
	 */
	static resolve(itemData) {
		abstract;
		return null;
	}

	/**
	 * 
	 * @param {string} code 
	 * @returns {BaseItem}
	 */
	static parseFromCode(code) {
		abstract;
		return null;
	}

	/**
	 * How the item should be treated as a boolean
	 * @returns {boolean}
	 */
	asBoolean() {
		abstract;
		return false;
	}

	/**
	 * How the item should be treated when displayed
	 * @returns {BaseItem}
	 */
	asDisplayItem() {
		return COLOR_ITEM_SINGLETONS[enumColors.white];
	}

	/**
	 * Render the item on a display (needed if not converted to color or shape) 
	 * @see ModItem#asDisplayItem
	 * @param {{system: DisplaySystem, origin: Vector, parameters: DrawParameters}} param0
	 */
	drawOnDisplay({ system, origin, parameters }) { }
}
