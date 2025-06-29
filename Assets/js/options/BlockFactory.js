import {IntBlock} from './IntBlock.js';
import {FloatBlock} from '@framework/js/options/FloatBlock.js';
import {StringBlock} from '@framework/js/options/StringBlock.js';
import {MediaBlock} from '@framework/js/options/MediaBlock.js';
import {SelectBlock} from '@framework/js/options/SelectBlock.js';
import {BoolBlock} from '@framework/js/options/BoolBlock.js';
import {TextareaBlock} from '@framework/js/options/TextareaBlock.js';
import {WysiwygBlock} from "@framework/js/options/WysiwygBlock";
import {UrlBlock} from '@framework/js/options/UrlBlock';
import {PageBlock} from "@framework/js/options/PageBlock";
import {Vector2Block} from '@framework/js/options/Vector2Block.js';
import {Vector3Block} from '@framework/js/options/Vector3Block.js';
// import {RepeaterBlock} from '@framework/js/options/RepeaterBlock.js';

export class BlockFactory {
    static types = {
        int: IntBlock,
        float: FloatBlock,
        string: StringBlock,
        media: MediaBlock,
        select: SelectBlock,
        bool: BoolBlock,
        textarea: TextareaBlock,
        wysiwyg: WysiwygBlock,
        url: UrlBlock,
        page: PageBlock,
        vector2: Vector2Block,
        vector3: Vector3Block,
        // repeater: RepeaterBlock, // WIP : RepeaterBlock - Pas encore fonctionnel
    };

    static register(type, clazz) {
        this.types[type] = clazz;
    }

    static create(type, key, label, value = null, options = [], onChange = null, group = 'default') {
        const BlockClass = this.types[type];
        if (!BlockClass)
            throw new Error(`Type de bloc inconnu : ${type}`);

        return new BlockClass(key, label, value, options, onChange, group);
    }
}
