import { MetaBuilding, defaultBuildingVariant, MetaBuildingVariant } from "../game/meta_building";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
import { atlasFiles } from "../core/atlas_definitions";
import { getFileAsDataURI } from "./mod_utils";
import { Loader } from "../core/loader";

/**
 * @typedef {{
 * url: string,
 * width: number,
 * height: number
 * }} ExternalSpriteMeta
 */

/**
 * @typedef {{
 * normal: ExternalSpriteMeta
 * blueprint: ExternalSpriteMeta
 * }} SpriteTypesMetas
 */

/**
 * @typedef {{
 * name: string,
 * description: string
 * }} BuildingVariantTranslation
 */

export class MetaModBuilding extends MetaBuilding {
    /**
     * Returns the building IDs
     * @returns {String}
     */
    static getId() {
        abstract;
        return;
    }

    /**
     * Returns the building variants IDs
     * @returns {Array<typeof MetaModBuildingVariant>}
     */
    static getVariants() {
        return [];
    }

    /**
     * Returns the building keybinding
     * @returns {String | number}
     */
    static getKeybinding() {
        abstract;
        return;
    }

    /**
     * Returns the keybinding translation
     * @returns {string}
     */
    static getKeybindingTranslation() {
        abstract;
        return;
    }

    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);

        /** @type {Object<string, AtlasSprite>} */
        this.cachedSprites = {};
    }
}

export class MetaModBuildingVariant extends MetaBuildingVariant {
    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {MetaModBuilding} building
     * @param {keyof SpriteTypesMetas} type
     * @returns {AtlasSprite}
     */
    static getSprite(rotationVariant, building, type = "normal") {
        const sprite_id =
            building.id +
            (this.getId() === defaultBuildingVariant ? "" : "-" + this.getId()) +
            "-" +
            rotationVariant +
            "-" +
            type;

        if (building.cachedSprites[sprite_id]) {
            return building.cachedSprites[sprite_id];
        }

        const sprite = new AtlasSprite(sprite_id);
        building.cachedSprites[sprite_id] = sprite;

        const meta = this.getSpriteMetas()[rotationVariant][type];
        const scales = atlasFiles.map(af => af.meta.scale);
        for (const res of scales) {
            sprite.linksByResolution[res] = Loader.spriteNotFoundSprite.linksByResolution[res];
        }

        getFileAsDataURI(meta.url).then(data => {
            const img = document.createElement("img");
            img.src = data;

            const link = new SpriteAtlasLink({
                atlas: img,
                packOffsetX: 0,
                packOffsetY: 0,
                packedX: 0,
                packedY: 0,
                packedW: meta.width,
                packedH: meta.height,
                w: meta.width,
                h: meta.width,
            });
            for (const res of scales) {
                sprite.linksByResolution[res] = link;
            }
        });

        return sprite;
    }

    static getBlueprintSprite(rotationVariant, building) {
        return this.getSprite(rotationVariant, building, "blueprint");
    }

    static getPreviewSprite(rotationVariant, building) {
        return this.getSprite(rotationVariant, building);
    }

    /**
     * Returns the sprite metadata for a given variant
     * @returns {Array<SpriteTypesMetas>}
     */
    static getSpriteMetas() {
        abstract;
        return [];
    }

    /**
     * @returns {BuildingVariantTranslation}
     */
    static getTranslations() {
        abstract;
        return;
    }
}
