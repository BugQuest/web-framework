export class OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        this.key = key;
        this.label = label;
        this.value = value;
        this.options = options;
        this.type = null;
        this.onChange = onChange;
        this.group = group;
        this.description = this.options?.description || null;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block';

        const descriptionIcon = this.renderDescriptionIcon();
        if (descriptionIcon) wrapper.appendChild(descriptionIcon);

        return wrapper;
    }


    renderDescriptionIcon() {
        if (!this.description) return null;

        const icon = document.createElement('span');
        icon.className = 'option-help';
        icon.textContent = '?';
        icon.dataset.tooltip = this.description;

        return icon;
    }

    notifyChange() {
        if (typeof this.onChange === 'function')
            this.onChange(this);
        else
            throw new Error('onChange is not assigned or is not a function');
    }
}
