import ConfirmDialog from "@framework/js/services/ConfirmDialog";
import { __ } from '@framework/js/services/Translator';

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
        this.onReset = this.options?.onReset || null;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block';
        wrapper.dataset.lazySmooth = '';

        const descriptionIcon = this.renderDescriptionIcon();
        if (descriptionIcon) wrapper.appendChild(descriptionIcon);

        wrapper.appendChild(this.renderReset());

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

    renderReset(){
        const resetButton = document.createElement('span');
        resetButton.className = 'option-reset';
        resetButton.dataset.tooltip = 'Reset to default';
        resetButton.onclick = () => {
            ConfirmDialog.show(
                () => {
                    this.resetToDefault();
                },
                async () => null,
                {
                    title: __('Confirmation', 'admin'),
                    message: __('Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?', 'admin'),
                    confirmText: __('Reset', 'admin'),
                    cancelText: __('Annuler', 'admin'),
                    confirmClass: 'button danger',
                    cancelClass: 'button info',
                }
            );
        };

        return resetButton;
    }

    notifyChange() {
        if (typeof this.onChange === 'function')
            this.onChange(this);
        else
            throw new Error('onChange is not assigned or is not a function');
    }

    getValue() {
        return this.value;
    }

    resetToDefault() {
        this.value = this.options.defaultValue || null;
        if (this.onReset)
            this.onReset(this);
        this.notifyChange();
    }
}
