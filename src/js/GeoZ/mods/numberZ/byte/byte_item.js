import { globalConfig } from "../../../../core/config";
import { smoothenDpi } from "../../../../core/dpi_manager";
import { DrawParameters } from "../../../../core/draw_parameters";
import { drawSpriteClipped } from "../../../../core/draw_utils";
import { BaseItem } from "../../../../game/base_item";
import { enumColors } from "../../../../game/colors";
import { BooleanItem } from "../../../../game/items/boolean_item";
import { COLOR_ITEM_SINGLETONS } from "../../../../game/items/color_item";
import { types } from "../../../../savegame/serialization";
import * as GeoZ from "../../../main";
import { numbers_img } from "../numberz.mod";

/**
 * 
 * @param {BaseItem} item 
 * @returns {ByteItem}
 */
export function asByteItem(item) {
	if (item instanceof ByteItem) return item;
	if (!item || (item instanceof BooleanItem) && !item.value) return new ByteItem(0);
	return new ByteItem(1);
}

export class ByteItem extends GeoZ.ModItem {
	static resolve(itemData) {
		return new ByteItem(itemData);
	}

	static parseFromCode(code) {
		if (!isNaN(parseInt(code))) {
			code = parseInt(code);
			if (code < 0 || code > 255) return null;
			return this.resolve(code);
		}
	}

	static getId() {
		return "byte_item";
	}

	static getSchema() {
		return types.uint;
	}

	asBoolean() {
		return !!this.value;
	}

	asDisplayItem() {
		return this.asBoolean() ? COLOR_ITEM_SINGLETONS[enumColors.white] : null;
	}

	serialize() {
		return this.value;
	}

	deserialize(data) {
		this.value = data;
	}

	getItemType() {
		return "byte";
	}

	/**
	 * @returns {string}
	 */
	getAsCopyableKey() {
		return this.value.toString();
	}

	/**
	 * @param {number} value
	 */
	constructor(value) {
		super();
		this.value = value % 256;
	}

	equalsImpl(other) {
		return this.value === /** @type {ByteItem} */ (other).value;
	}

	/**
	 * Draws the item to a canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {number} size
	 */
	drawFullSizeOnCanvas(context, size) {
		/*if (!this.cachedSprite) {
			this.cachedSprite = Loader.getSprite("sprites/colors/" + this.color + ".png");
		}
		this.cachedSprite.drawCentered(context, size / 2, size / 2, size);*/
		this.internalGenerateColorBuffer(null, context, size, size, 1);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} diameter
	 * @param {DrawParameters} parameters
	 */
	drawItemCenteredImpl(x, y, parameters, diameter = globalConfig.defaultItemDiameter) {
		if (!this.bufferGenerator) {
			this.bufferGenerator = this.internalGenerateColorBuffer.bind(this);
		}

		const realDiameter = diameter * 0.6;
		const dpi = smoothenDpi(globalConfig.shapesSharpness * parameters.zoomLevel);
		const key = realDiameter + "/" + dpi + "/" + this.value;
		const canvas = parameters.root.buffers.getForKey({
			key: "byteitem",
			subKey: key,
			w: realDiameter,
			h: realDiameter,
			dpi,
			redrawMethod: this.bufferGenerator,
		});

		drawSpriteClipped({
			parameters,
			sprite: canvas,
			x: x - realDiameter / 2,
			y: y - realDiameter / 2,
			w: realDiameter,
			h: realDiameter,
			originalW: realDiameter * dpi,
			originalH: realDiameter * dpi,
		});
	}

	/**
	 *
	 * @param {HTMLCanvasElement} canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {number} w
	 * @param {number} h
	 * @param {number} dpi
	 */
	internalGenerateColorBuffer(canvas, context, w, h, dpi) {
		context.translate((w * dpi) / 2, (h * dpi) / 2);
		context.scale((dpi * w) / 12, (dpi * h) / 12);

		const s = this.value.toString();
		for (let i = 0; i < s.length; i++) {
			const d = s[i];
			context.drawImage(numbers_img[d], 0, 0, 64, 64, -w / 2 + (i * w / s.length), -h / 2, w / s.length, h);
		}
	}
}