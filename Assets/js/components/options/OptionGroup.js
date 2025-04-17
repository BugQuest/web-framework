export class OptionGroup {
    constructor(name) {
        this.name = name;
        this.blocks = [];
    }

    addBlock(block) {
        this.blocks.push(block);
    }

    render() {
        const container = document.createElement('div');
        container.className = '__optionGroup';

        const title = document.createElement('h2');
        title.textContent = this.name;
        container.appendChild(title);

        this.blocks.forEach(block => {
            container.appendChild(block.render());
        });

        return container;
    }
}
