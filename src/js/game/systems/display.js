import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { makeOffscreenBuffer } from "../../core/buffer_utils";
import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { DisplayComponent } from "../components/display";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { isTrueItem } from "../items/boolean_item";
import { ColorItem, COLOR_ITEM_SINGLETONS } from "../items/color_item";
import { MapChunkView } from "../map_chunk_view";

const colorCanvasSize = 65;
const colorCanvasMargin = 3;
const colorCanvasRadius = 3;

export class DisplaySystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [DisplayComponent]);

        /** @type {Object<string, import("../../core/draw_utils").AtlasSprite>} */
        this.displaySprites = {};

        /** @type {Object<string, HTMLCanvasElement>} */
        this.cachedCanvases = {};

        for (const colorId in enumColors) {
            if (colorId === enumColors.uncolored) {
                continue;
            }
            this.displaySprites[colorId] = Loader.getSprite("sprites/wires/display/" + colorId + ".png");
        }
    }

    /**
     * Returns the color / value a display should show
     * @param {BaseItem} value
     * @returns {BaseItem}
     */
    getDisplayItem(value) {
        if (!value) {
            return null;
        }

        switch (value.getItemType()) {
            case "boolean": {
                return isTrueItem(value) ? COLOR_ITEM_SINGLETONS[enumColors.white] : null;
            }

            case "color": {
                const item = /**@type {ColorItem} */ (value);
                return item.color === enumColors.uncolored ? null : item;
            }

            case "shape": {
                return value;
            }

            default:
                assertAlways(false, "Unknown item type: " + value.getItemType());
        }
    }

    /**
     * Draws a given chunk
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            if (entity && entity.components.Display) {
                const pinsComp = entity.components.WiredPins;
                const network = pinsComp.slots[0].linkedNetwork;

                if (!network || !network.currentValue) {
                    continue;
                }

                const value = this.getDisplayItem(network.currentValue);

                if (!value) {
                    continue;
                }

                const origin = entity.components.StaticMapEntity.origin;
                if (value.getItemType() === "color") {
                    const size = globalConfig.tileSize;
                    

                    const color = /** @type {ColorItem} */ (value).color;
                    const sprite = this.displaySprites[color];
                    if(sprite) {
                        sprite.drawCachedCentered(
                            parameters,
                            (origin.x + 0.5) * size,
                            (origin.y + 0.5) * size,
                            size
                        );
                        continue;
                    }
                    
                    let canvas = this.cachedCanvases[color];
                    if(!canvas) {
                        canvas = this.generateColorCanvas(color);
                        this.cachedCanvases[color] = canvas;
                    }

                    const x = (origin.x + 0.5) * size - size / 2;
                    const y = (origin.y + 0.5) * size - size / 2;

                    parameters.context.drawImage(canvas, x, y, size, size);
                } else if (value.getItemType() === "shape") {
                    value.drawItemCenteredClipped(
                        (origin.x + 0.5) * globalConfig.tileSize,
                        (origin.y + 0.5) * globalConfig.tileSize,
                        parameters,
                        30
                    );
                }
            }
        }
    }

    /**
     * Generates a canvas for a specific color
     * @param {string} color 
     * @returns {HTMLCanvasElement}
     */
    generateColorCanvas(color) {
        const [canvas, context] = makeOffscreenBuffer(colorCanvasSize, colorCanvasSize, {
            reusable: true,
            label: "buffer-display/" + color,
            smooth: true
        });

        const rectSize = colorCanvasSize - colorCanvasMargin * 2;

        context.fillStyle = color;
        context.beginRoundedRect(
            colorCanvasMargin,
            colorCanvasMargin,
            rectSize,
            rectSize,
            colorCanvasRadius);
        context.fill();

        //ALT : draw square and set corners alpha to 108

        return canvas;
    }
}
