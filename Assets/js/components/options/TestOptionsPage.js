import {OptionsPage} from './OptionsPage';
import {__} from '../Translator';
import BuildHelper from '../BuildHelper';

export class TestOptionsPage extends OptionsPage {
    constructor() {
        super('test');
    }

    render() {
        const wrapper = BuildHelper.div('options-wrapper');

        const intBlock = this.createBlock(
            'int',
            'test_int_value',
            __('Valeur entière', 'admin'),
            null,
            {
                description: __('Un nombre entier à saisir', 'admin'),
            },
            'test'
        );

        const floatBlock = this.createBlock(
            'float',
            'test_float_value',
            __('Valeur décimale', 'admin'),
            null,
            {
                description: __('Un nombre à virgule pour les tests', 'admin'),
            }
        );

        const stringBlock = this.createBlock(
            'string',
            'test_string_value',
            __('Texte simple', 'admin'),
            null,
            {
                description: __('Une chaîne de texte modifiable', 'admin'),
                placeholder: __('Entrez du texte...', 'admin'),
            },
            'test'
        );

        const boolBlock = this.createBlock(
            'bool',
            'test_bool_value',
            __('Activer la fonctionnalité ?', 'admin'),
            null,
            {
                description: __('Active ou désactive la fonctionnalité de test', 'admin'),
            },
            'test'
        );

        const selectBlock = this.createBlock(
            'select',
            'test_select_value',
            __('Type de choix', 'admin'),
            null,
            {
                description: __('Choisissez une des options', 'admin'),
                options: [
                    {value: 'alpha', label: 'Alpha'},
                    {value: 'beta', label: 'Bêta'},
                    {value: 'gamma', label: 'Gamma'},
                ]
            },
            'test'
        );

        const mediaBlock = this.createBlock(
            'media',
            'test_media_value',
            __('Fichier média', 'admin'),
            null,
            {
                description: __('Sélectionnez un média pour le test', 'admin'),
                mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
                label: __('Choisir un média', 'admin')
            },
            'test'
        );

        // Ajout à l'interface
        [
            intBlock,
            floatBlock,
            stringBlock,
            boolBlock,
            selectBlock,
            mediaBlock,
        ].forEach(block => block.render(wrapper));

        this.container.appendChild(wrapper);
    }
}
