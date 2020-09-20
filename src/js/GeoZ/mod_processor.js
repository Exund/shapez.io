import { Entity } from "../game/entity";
import { ItemProcessorSystem } from "../game/systems/item_processor";
import { BaseItem } from "../game/base_item";

export class ModProcessor {
    /**
     * @returns {String}
     */
    static getType() {
        return this.prototype.constructor.name;
    }

    /**
     * @returns {Number}
     */
    static getBaseSpeed() {
        abstract;
        return 0;
    }

    /**
     * Checks whether it's possible to process something
     * @param {Entity} entity
     * @returns {Boolean}
     */
    static canProcess(entity) {
        return true;
    }

    /**
     * Process ther current item
     * @param {import("../game/systems/item_processor").ProcessorImplementationPayload} param0
     */
    static process({ items, itemsBySlot, entity, outItems, system }) {
        abstract;
    }
}
