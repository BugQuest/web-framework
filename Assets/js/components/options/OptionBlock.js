export class OptionBlock {
    constructor(key, label, value = null, onChange = null, group = 'default') {
        this.key = key;
        this.label = label;
        this.value = value;
        this.onChange = onChange;
        this.group = group;
    }

    render() {
        throw new Error('render() must be implemented in subclass');
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }

    notifyChange() {
        if (typeof this.onChange === 'function') {
            this.onChange(this.key, this.value);
        }
    }
}
