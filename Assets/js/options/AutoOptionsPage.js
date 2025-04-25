import {OptionsPage} from '@framework/js/options/OptionsPage';
import {OptionGroup} from '@framework/js/options/OptionGroup';
import {__} from '@framework/js/services/Translator';
import Builder from '@framework/js/services/Builder';

export default class AutoOptionsPage extends OptionsPage {
    constructor() {
        super('tmp', '#__option');

        this.option = JSON.parse(this.container.dataset.option);
        this.group = this.option.group;

        this.optionGroups = {};
    }

    render() {
        if (!this.container) return;

        for (const block of this.option.blocks) {
            const group = block.group || 'default';
            if (!(group in this.optionGroups))
                this.optionGroups[group] = new OptionGroup(group);

            this.optionGroups[group].addBlock(
                this.createBlock(
                    block.type,
                    block.key,
                    block.label,
                    block.defaultValue,
                    block.options,
                )
            )
        }

        for (const group of Object.values(this.optionGroups))
            group.render(this.container);
    }
}