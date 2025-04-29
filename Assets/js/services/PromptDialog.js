import Builder from '@framework/js/services/Builder.js';
import {__} from '@framework/js/services/Translator.js';

export default class PromptDialog {
    static show(
        onConfirm = (value) => {
        },
        onCancel = () => {
        },
        options = {}
    ) {
        const defaults = {
            title: __('Saisie requise', 'admin'),
            message: __('Veuillez entrer une valeur.', 'admin'),
            confirmText: __('Valider', 'admin'),
            cancelText: __('Annuler', 'admin'),
            placeholder: '',
            defaultValue: '',
            confirmClass: 'button success',
            cancelClass: 'button danger'
        };

        const {
            title,
            message,
            confirmText,
            cancelText,
            placeholder,
            defaultValue,
            confirmClass,
            cancelClass
        } = {...defaults, ...options};

        const title_el = Builder.div('prompt-title');
        title_el.textContent = title;

        const overlay_el = Builder.div('prompt-overlay');
        const box_el = Builder.div('prompt-box');

        const message_el = Builder.div('prompt-message');
        message_el.textContent = message;

        const input_el = Builder.input_text('', defaultValue);
        if (placeholder) input_el.placeholder = placeholder;

        const actions_el = Builder.div('prompt-actions');

        const confirm_el = Builder.button(confirmText, confirmClass, () => {
            onConfirm(input_el.value);
            overlay_el.remove();
        });

        const cancel_el = Builder.button(cancelText, cancelClass, () => {
            onCancel();
            overlay_el.remove();
        });

        actions_el.append(confirm_el, cancel_el);

        box_el.append(title_el, message_el, input_el, actions_el);
        overlay_el.appendChild(box_el);
        document.body.appendChild(overlay_el);

        // Petite animation d'entrée
        setTimeout(() => overlay_el.classList.add('active'), 10);

        // Focus auto
        setTimeout(() => input_el.focus(), 100);
    }
}
