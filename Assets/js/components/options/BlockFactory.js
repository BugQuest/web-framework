import {IntBlock} from './IntBlock.js';
import {FloatBlock} from './FloatBlock.js';
import {StringBlock} from './StringBlock.js';
import {MediaBlock} from './MediaBlock.js';
import {SelectBlock} from './SelectBlock.js';
import {BoolBlock} from './BoolBlock.js';

export class BlockFactory {
    static types = {
        int: IntBlock,
        float: FloatBlock,
        string: StringBlock,
        media: MediaBlock,
        select: SelectBlock,
        bool: BoolBlock,
    };

    static register(type, clazz) {
        this.types[type] = clazz;
    }

    static create(type, key, label, value = null, options = [], onChange = null, group = 'default') {
        const BlockClass = this.types[type];
        if (!BlockClass) {
            throw new Error(`Type de bloc inconnu : ${type}`);
        }
        return new BlockClass(key, label, value, options, onChange, group);
    }
}
