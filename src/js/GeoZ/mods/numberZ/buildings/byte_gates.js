import { enumDirection, Vector } from "../../../../core/vector";
import { BaseItem } from "../../../../game/base_item";
import { LogicGateComponent } from "../../../../game/components/logic_gate";
import { enumPinSlotType, WiredPinsComponent } from "../../../../game/components/wired_pins";
import { Entity } from "../../../../game/entity";
import { defaultBuildingVariant } from "../../../../game/meta_building";
import { LogicGateSystem } from "../../../../game/systems/logic_gate";
import { asByteItem, ByteItem } from "../byte/byte_item";
import * as GeoZ from "../../../main";

export class MetaByteGatesBuilding extends GeoZ.MetaModBuilding {
	static getId() {
		return "byte_gate";
	}

	static getKeybinding() {
		return "L";
	}

	static getTranslations() {
		return {
			variants: {
				[defaultBuildingVariant]: {
					name: "AND Gate",
					description: "Test GeoZ building for custom item",
				},
				ORGate: {
					name: "OR Gate",
					description: "Test GeoZ building for custom item",
				},
				XORGate: {
					name: "XOR Gate",
					description: "Test GeoZ building for custom item",
				},
				NOTGate: {
					name: "NOT Gate",
					description: "Test GeoZ building for custom item",
				}
			},
			keybinding: "Byte Gate",
		};
	}

	static getVariants() {
		return ["XORGate", "ORGate", "NOTGate"];
	}

	constructor() {
		super("byte_gate");
	}

	getSilhouetteColor() {
		return "#89dc60";
	}

	getDimensions() {
		return new Vector(1, 1);
	}

	getAvailableVariants() {
		return [...super.getAvailableVariants(null), ...MetaByteGatesBuilding.getVariants()];
	}

	/**
	 * @returns {Layer}
	 */
	getLayer() {
		return "wires";
	}

	/**
	 * @returns {import("../../../mod_building").BuildingSpriteMetas}
	 */
	getSpriteMetas() {
		return {
			[defaultBuildingVariant]: [
				{
					normal: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/buildings/logic_gate.png",
						width: 192,
						height: 192,
					},
					blueprint: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/blueprints/logic_gate.png",
						width: 192,
						height: 192,
					},
				},
			],
			ORGate: [
				{
					normal: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/buildings/logic_gate-or.png",
						width: 192,
						height: 192,
					},
					blueprint: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/blueprints/logic_gate-or.png",
						width: 192,
						height: 192,
					},
				},
			],
			XORGate: [
				{
					normal: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/buildings/logic_gate-xor.png",
						width: 192,
						height: 192,
					},
					blueprint: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/blueprints/logic_gate-xor.png",
						width: 192,
						height: 192,
					},
				},
			],
			NOTGate: [
				{
					normal: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/buildings/logic_gate-not.png",
						width: 192,
						height: 192,
					},
					blueprint: {
						url:
							"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/blueprints/logic_gate-not.png",
						width: 192,
						height: 192,
					},
				},
			]
		};
	}

	getRenderPins() {
		// We already have it included
		return false;
	}

	/**
	 * @param {Entity} entity
	 * @param {string} variant
	 */
	updateVariants(entity, rotationVariant, variant) {
		entity.components.LogicGate.type = enumInvertedGatesVariants[variant];

		const pinComp = entity.components.WiredPins;

		if (variant.includes("NOT")) {
			pinComp.setSlots([
				{
					pos: new Vector(0, 0),
					direction: enumDirection.top,
					type: enumPinSlotType.logicalEjector,
				},
				{
					pos: new Vector(0, 0),
					direction: enumDirection.bottom,
					type: enumPinSlotType.logicalAcceptor,
				},
			]);
		} else {
			pinComp.setSlots([
				{
					pos: new Vector(0, 0),
					direction: enumDirection.top,
					type: enumPinSlotType.logicalEjector,
				},
				{
					pos: new Vector(0, 0),
					direction: enumDirection.left,
					type: enumPinSlotType.logicalAcceptor,
				},
				{
					pos: new Vector(0, 0),
					direction: enumDirection.right,
					type: enumPinSlotType.logicalAcceptor,
				},
			]);
		}
	}

	/**
	 * Creates the entity at the given location
	 * @param {Entity} entity
	 */
	setupEntityComponents(entity) {
		entity.addComponent(
			new WiredPinsComponent({
				slots: [
					{
						pos: new Vector(0, 0),
						direction: enumDirection.top,
						type: enumPinSlotType.logicalEjector,
					},
					{
						pos: new Vector(0, 0),
						direction: enumDirection.left,
						type: enumPinSlotType.logicalAcceptor,
					},
					{
						pos: new Vector(0, 0),
						direction: enumDirection.right,
						type: enumPinSlotType.logicalAcceptor,
					},
				],
			})
		);

		entity.addComponent(new LogicGateComponent({ type: ByteANDGate.getType() }));
	}
}

export const enumInvertedGatesVariants = {
	[defaultBuildingVariant]: "ByteANDGate",
};

for (const v of MetaByteGatesBuilding.getVariants()) {
	enumInvertedGatesVariants[v] = `Byte${v}`;
}

export class ByteNOTGate extends GeoZ.ModWireProcessor {
	/**
	 * @param {Array<BaseItem|null>} parameters
	 * @param {LogicGateSystem} system
	 * @returns {Array<BaseItem>|BaseItem}
	 */
	static compute(system, parameters) {
		assert(parameters.length === 1, "bad parameter count for NOT");
		const p1 = asByteItem(parameters[0]);

		let bin = p1.value.toString(2).padStart(8, "0");

		bin = bin.replace(/0/g, "_").replace(/1/g, "0").replace(/_/g, "1");

		return new ByteItem(parseInt(bin, 2));
	}
}

export class ByteANDGate extends GeoZ.ModWireProcessor {
	/**
	 * @param {Array<BaseItem|null>} parameters
	 * @param {LogicGateSystem} system
	 * @returns {Array<BaseItem>|BaseItem}
	 */
	static compute(system, parameters) {
		assert(parameters.length === 2, "bad parameter count for AND");
		const p1 = asByteItem(parameters[0]);
		const p2 = asByteItem(parameters[1]);

		return new ByteItem(p1.value & p2.value);
	}
}

export class ByteORGate extends GeoZ.ModWireProcessor {
	/**
	 * @param {Array<BaseItem|null>} parameters
	 * @param {LogicGateSystem} system
	 * @returns {Array<BaseItem>|BaseItem}
	 */
	static compute(system, parameters) {
		assert(parameters.length === 2, "bad parameter count for OR");
		const p1 = asByteItem(parameters[0]);
		const p2 = asByteItem(parameters[1]);

		return new ByteItem(p1.value | p2.value);
	}
}

export class ByteXORGate extends GeoZ.ModWireProcessor {
	/**
	 * @param {Array<BaseItem|null>} parameters
	 * @param {LogicGateSystem} system
	 * @returns {Array<BaseItem>|BaseItem}
	 */
	static compute(system, parameters) {
		assert(parameters.length === 2, "bad parameter count for XOR");
		const p1 = asByteItem(parameters[0]);
		const p2 = asByteItem(parameters[1]);

		return new ByteItem(p1.value ^ p2.value);
	}
}