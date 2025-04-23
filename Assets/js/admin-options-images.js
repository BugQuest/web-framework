import {BlockFactory} from './components/options/BlockFactory';
import OptionManager from './components/options/OptionManager';
import {Toast} from './components/Toast';
import {__} from "./components/Translator";

const compression_method = BlockFactory.create(
    'select',
    'compression_method',
    'Méthode de compression',
    '',
    [
        {value: 'none', label: 'Aucune'},
        {value: 'webp', label: 'WebP (si supporté)'},
        {value: 'avif', label: 'AVIF (si supporté)'}
    ],
    (k, v) => {
        OptionManager.saveOption('images', k, v)
            .then(res => {
                Toast.show(__('La méthode de compression a été enregistrée avec succès', 'admin'), {
                    type: 'success',
                    icon: '✅',
                    duration: 5000,
                    position: 'bottom-right',
                    closable: true
                })
            })
            .catch(err => {
                console.error(err);
                Toast.show(__("Erreur lors de l'enregistrement de la méthode de compression", 'admin'), {
                    type: 'error',
                    icon: '❌',
                    duration: 5000,
                    position: 'bottom-right',
                    closable: true
                })
            });
    },
    'images'
);

// Ajout du placeholder des images
const placeholder = BlockFactory.create(
    'media', 'placeholder',
    'Image de remplacement',
    '',
    {
        type: 'image',
        multiple: false,
        allowEmpty: true,
        label: 'Sélectionnez une image de remplacement'
    },
    (k, v) => {
        OptionManager.saveOption('images', k, v)
            .then(res => {
                Toast.show(__('L\'image de remplacement a été enregistrée avec succès', 'admin'), {
                    type: 'success',
                    icon: '✅',
                    duration: 5000,
                    position: 'bottom-right',
                    closable: true
                })
            })
            .catch(err => {
                console.error(err);
                Toast.show(__("Erreur lors de l'enregistrement de l'image de remplacement", 'admin'), {
                    type: 'error',
                    icon: '❌',
                    duration: 5000,
                    position: 'bottom-right',
                    closable: true
                })
            });
    }, 'images');

const container = document.querySelector('#options-container');
compression_method.render(container);
placeholder.render(container);
