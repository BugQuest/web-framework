import BuildHelper from './BuildHelper.js';
import {__} from './Translator.js';

export default class ConfirmDialog {
    static show(
        onConfirm = () => {
        },
        onCancel = () => {
        },
        options = {}
    ) {
        const defaults = {
            title: __('Confirmation', 'admin'),
            message: __('Êtes-vous sûr de vouloir continuer ?', 'admin'),
            confirmText: __('Valider', 'admin'),
            cancelText: __('Annuler', 'admin'),
            confirmClass: 'button success',
            cancelClass: 'button danger'
        };

        const {title, message, confirmText, cancelText, confirmClass, cancelClass} = {...defaults, ...options};

        const title_el = BuildHelper.div('confirm-title');
        title_el.textContent = title;

        const overlay_el = BuildHelper.div('confirm-overlay');
        const box_el = BuildHelper.div('confirm-box');

        const message_el = BuildHelper.div('confirm-message');
        message_el.textContent = message;

        const actions_el = BuildHelper.div('confirm-actions');

        const confirm_el = BuildHelper.button(confirmText, confirmClass, () => {
            onConfirm();
            overlay_el.remove();
        })

        const cancel_el = BuildHelper.button(cancelText, cancelClass, () => {
            onCancel();
            overlay_el.remove();
        })

        actions_el.append(confirm_el, cancel_el);
        box_el.append(title_el, message_el, actions_el);
        overlay_el.appendChild(box_el);
        document.body.appendChild(overlay_el);

        setTimeout(() => overlay_el.classList.add('active'), 10);
    }
}
