import {IntBlock} from './IntBlock.js';
import {FloatBlock} from '@framework/js/options/FloatBlock.js';
import {StringBlock} from '@framework/js/options/StringBlock.js';
import {MediaBlock} from '@framework/js/options/MediaBlock.js';
import {SelectBlock} from '@framework/js/options/SelectBlock.js';
import {BoolBlock} from '@framework/js/options/BoolBlock.js';
import {TextareaBlock} from '@framework/js/options/TextareaBlock.js';
import {WysiwygBlock} from "@framework/js/options/WysiwygBlock";

export class BlockFactory {
    static types = {
        int: IntBlock,
        float: FloatBlock,
        string: StringBlock,
        media: MediaBlock,
        select: SelectBlock,
        bool: BoolBlock,
        textarea: TextareaBlock,
        wysiwig: WysiwygBlock,
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
