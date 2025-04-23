import Builder from '@framework/js/services/Builder.js';

export class OptionGroup {
    constructor(label = null, blocks = []) {
        this.label = label;
        this.blocks = blocks || [];
    }

    addBlock(block) {
        this.blocks.push(block);
    }

    render(container) {
        const wrapper = Builder.div('option-group');

        if (this.label)
            wrapper.appendChild(Builder.h2(this.label, 'option-group-title'));

        const blocksWrapper = Builder.div('option-group-blocks');
        wrapper.appendChild(blocksWrapper);

        this.blocks.forEach(block => {
            block.render(blocksWrapper)
        });

        container.appendChild(wrapper);
    }
}
