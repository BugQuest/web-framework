import { BlockFactory } from './BlockFactory';
import OptionManager from './OptionManager';
import { Toast } from '@framework/js/services/Toast';
import { __ } from '@framework/js/services/Translator';

export class OptionsPage {
    constructor(group, containerSelector = '#options-container') {
        this.group = group;
        this.container = document.querySelector(containerSelector);
        this.options = {};
        this.blocks = [];
    }

    async init() {
        try {
            this.options = await OptionManager.getOptions(this.group);
            this.render();
        } catch (err) {
            console.error(`[OptionsPage] Erreur chargement "${this.group}":`, err);
            Toast.show(__('Erreur lors du chargement des options', 'admin'), {
                type: 'danger',
                icon: '❌'
            });
        }
    }

    render() {
        throw new Error('La méthode render() doit être implémentée dans la sous-classe');
    }

    createBlock(type, key, label, defaultValue = null, options = {}, group = this.group) {
        const value = key in this.options ? this.options[key] : defaultValue;

        const block = BlockFactory.create(
            type,
            key,
            label,
            value,
            options,
            (option) => this.handleSaveOption(option),
            group
        );

        this.blocks.push(block);
        return block;
    }

    async handleSaveOption(option) {
        try {
            await OptionManager.saveOption(option);
            Toast.show(__('Option enregistrée avec succès', 'admin'), {
                type: 'success',
                icon: '✅',
                duration: 4000,
                position: 'bottom-right',
                closable: true
            });
        } catch (err) {
            console.error('[OptionsPage] Erreur save option:', err);
            Toast.show(__('Erreur lors de l\'enregistrement', 'admin'), {
                type: 'error',
                icon: '❌',
                duration: 4000,
                position: 'bottom-right',
                closable: true
            });
        }
    }

    renderBlocks(...blocks) {
        blocks.forEach(block => block.render(this.container));
    }
}
