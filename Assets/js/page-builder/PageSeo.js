import {Toast} from "@framework/js/services/Toast";
import Builder from '@framework/js/services/Builder';
import {LazySmooth} from '@framework/js/services/LazySmooth';
import {MediaBlock} from '@framework/js/options/MediaBlock';
import StructuredDataEditor from '@framework/js/services/StructuredDataEditor';
import OpenGraphEditor from '@framework/js/services/OpenGraphEditor';

export default class PageSeo {
    constructor(element) {
        this.element = element;
        try {
            this.page = JSON.parse(element.dataset.page);
        } catch (e) {
            this.page = {};
            Toast.error('Error parsing page data');
        }

        if (!('seo' in this.page) || this.page.seo === null || this.page.seo === undefined)
            this.page.seo = {
                redirect_to: '',
                no_index: false,
                no_follow: false,
                canonical_url: '',
                meta: {},
                open_graph: {},
                structured_data: {},
                twitter: {}
            };

        this.backup = JSON.parse(JSON.stringify(this.page.seo));
    }

    editValue(key, value) {
        if (key in this.page.seo) {
            this.page.seo[key] = value;
        } else {
            this.page.seo[key] = value;
        }

        //if empty, remove the key
        if (value === '' || value === null || value === undefined)
            delete this.page.seo[key];

        this.checkDirty();
    }

    editSubValue(key, subKey, value) {
        if (key in this.page.seo) {
            if (Array.isArray(this.page.seo[key]))
                this.page.seo[key] = {}
            this.page.seo[key][subKey] = value;
        } else {
            this.page.seo[key] = {};
            this.page.seo[key][subKey] = value;
        }

        //if empty, remove the key
        if (value === '' || value === null || value === undefined)
            delete this.page.seo[key][subKey];

        this.checkDirty();
    }

    checkDirty() {
        if (JSON.stringify(this.page.seo) !== JSON.stringify(this.backup)) {
            this.actions_el.classList.add('active');
        } else {
            this.actions_el.classList.remove('active');
        }
        window.debugPanel.updateValue('page_seo', this.page.seo);
    }

    render() {
        //base
        const accordeon = Builder.accordion('Base');
        this.element.appendChild(accordeon.accordeon);
        this.renderBase(accordeon.accordeon_content);

        const accordeon_meta = Builder.accordion('Meta');
        this.element.appendChild(accordeon_meta.accordeon);
        this.renderMeta(accordeon_meta.accordeon_content);

        //og
        const accordeon_og = Builder.accordion('Open Graph');
        this.element.appendChild(accordeon_og.accordeon);
        const og_editor = new OpenGraphEditor(accordeon_og.accordeon_content);
        og_editor.onChange((values) => {
            this.editValue('open_graph', values);
        });

        //twitter / x
        const accordeon_twitter = Builder.accordion('Twitter / X');
        this.element.appendChild(accordeon_twitter.accordeon);
        this.renderTwitterX(accordeon_twitter.accordeon_content);

        //structured data
        const accordeon_structured_data = Builder.accordion('Structured Data');
        this.element.appendChild(accordeon_structured_data.accordeon);
        const structured_data_editor = new StructuredDataEditor(accordeon_structured_data.accordeon_content);
        structured_data_editor.onChange((values) => {
            this.editValue('structured_data', values);
        });

        //action
        this.actions_el = Builder.div('seo-actions');
        const save = Builder.button('Save', 'submit', () => this.save());
        const reset = Builder.button('Reset', 'reset', () => {
            this.page.seo = JSON.parse(JSON.stringify(this.backup));
            structured_data_editor.loadData(this.page.seo.structured_data)
            og_editor.loadData(this.page.seo.open_graph);
            this.reset_base();
            this.reset_meta();
            this.reset_twitter();
            this.checkDirty();
        });
        this.actions_el.appendChild(save);
        this.actions_el.appendChild(reset);
        document.body.appendChild(this.actions_el);
    }

    renderBase(container) {
        const container_form = Builder.div("container-form");
        const header = Builder.div('form-header');
        const header_title = Builder.h2('Base', 'form-title')
        header.appendChild(header_title);
        container.appendChild(container_form);
        container_form.appendChild(header);
        const body = Builder.div('form-body');
        container_form.appendChild(body);

        const redirect_to = Builder.input_text('Redirect to...', this.page?.seo?.redirect_to, 'flex-1');
        redirect_to.addEventListener('input', (e) => {
            this.editValue('redirect_to', e.target.value);
        });

        const redirect_to_label = Builder.label('Redirect to');
        const redirect_to_group = Builder.div('form-group');

        const no_index = Builder.switch(this.page?.seo?.no_index, (value) => {
            this.editValue('no_index', value);
        });
        const no_follow = Builder.switch(this.page?.seo?.no_follow, (value) => {
            this.editValue('no_follow', value);
        });
        const no_index_label = Builder.label('No index');
        const no_follow_label = Builder.label('No follow');
        const no_index_group = Builder.div('form-group');
        const no_follow_group = Builder.div('form-group');

        const canonical = Builder.input_text('Canonical URL...', this.page?.seo?.canonical_url, 'flex-1');
        canonical.addEventListener('input', (e) => {
            this.editValue('canonical_url', e.target.value);
        });
        const canonical_label = Builder.label('Canonical URL');
        const canonical_group = Builder.div('form-group');

        redirect_to_group.appendChild(redirect_to_label);
        redirect_to_group.appendChild(redirect_to);

        no_index_group.appendChild(no_index_label);
        no_index_group.appendChild(no_index.element);

        no_follow_group.appendChild(no_follow_label);
        no_follow_group.appendChild(no_follow.element);

        canonical_group.appendChild(canonical_label);
        canonical_group.appendChild(canonical);

        body.appendChild(redirect_to_group);
        body.appendChild(no_index_group);
        body.appendChild(no_follow_group);
        body.appendChild(canonical_group);

        this.reset_base = () => {
            redirect_to.value = this.page?.seo?.redirect_to || '';
            no_index.toggle(this.page?.seo?.no_index || false);
            no_follow.toggle(this.page?.seo?.no_follow || false);
            canonical.value = this.page?.seo?.canonical_url || '';
        }
    }

    renderMeta(container) {
        const meta_container = Builder.div("container-form");

        const meta_header = Builder.div('form-header');
        const meta_header_title = Builder.h2('Meta', 'form-title')
        meta_header.appendChild(meta_header_title);
        meta_container.appendChild(meta_header);

        const meta_body = Builder.div('form-body');
        meta_container.appendChild(meta_body);

        const meta_form_group_title = Builder.div('form-group');
        meta_body.appendChild(meta_form_group_title);
        const meta_title_label = Builder.label('Title');
        const meta_title = Builder.input_text(this.page?.title || 'Meta title...', this.page?.seo?.meta?.title, 'flex-1');
        meta_title.addEventListener('input', (e) => {
            this.editSubValue('meta', 'title', e.target.value);
        });
        meta_form_group_title.appendChild(meta_title_label);
        meta_form_group_title.appendChild(meta_title);

        const meta_form_group_description = Builder.div('form-group');
        meta_body.appendChild(meta_form_group_description);
        const meta_description_label = Builder.label('Description');
        const meta_description = Builder.textarea('Meta description...', this.page?.seo?.meta?.description, 'fullw');
        meta_description.addEventListener('input', (e) => {
            this.editSubValue('meta', 'description', e.target.value);
        });
        meta_description.setAttribute('maxlength', 160);
        meta_form_group_description.appendChild(meta_description_label);
        meta_form_group_description.appendChild(meta_description);

        const meta_form_group_keywords = Builder.div('form-group');
        meta_body.appendChild(meta_form_group_keywords);
        const meta_keywords = Builder.keywords('Meta Keywords', 'Ajouter un mot clé...', this.page?.seo?.meta?.keywords?.split(','), (values) => {
            this.editSubValue('meta', 'keywords', values.join(','));
        }, 'fullw');
        meta_form_group_keywords.appendChild(meta_keywords.getElement());

        container.appendChild(meta_container);

        this.reset_meta = () => {
            meta_title.value = this.page?.seo?.meta_title || '';
            meta_description.value = this.page?.seo?.meta_description || '';
            meta_keywords.setValue(this.page?.seo?.meta_keywords?.split(','));
        };
    }

    renderTwitterX(container) {
        const twitter_container = Builder.div("container-form");
        const twitter_header = Builder.div('form-header');
        const twitter_header_title = Builder.h2('Twitter / X', 'form-title')
        twitter_header.appendChild(twitter_header_title);
        const twitter_body = Builder.div('form-body');
        twitter_container.appendChild(twitter_header);
        twitter_container.appendChild(twitter_body);

        const twitter_form_group_title = Builder.div('form-group');
        twitter_body.appendChild(twitter_form_group_title);
        const twitter_title_label = Builder.label('Title');
        const twitter_title = Builder.input_text(this.page?.title || 'Twitter title...', this.page?.seo?.twitter?.title, 'flex-1');
        twitter_title.addEventListener('input', (e) => {
            this.editSubValue('twitter', 'title', e.target.value);
        });
        twitter_form_group_title.appendChild(twitter_title_label);
        twitter_form_group_title.appendChild(twitter_title);

        const twitter_image = new MediaBlock(
            'twitter_image',
            'Image',
            this.page?.seo?.twitter?.image || null,
            {
                description: 'Image to use for Twitter',
                mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                size: 'twitter',
                compression_method: 'none'
            },
            (option) => {
                this.editSubValue('twitter', 'image', option.getValue());
            },
        );
        twitter_image.render(twitter_form_group_title);

        const twitter_form_group_description = Builder.div('form-group');
        twitter_body.appendChild(twitter_form_group_description);
        const twitter_description_label = Builder.label('Description');
        const twitter_description = Builder.textarea('Twitter description...', this.page?.seo?.twitter?.description, 'fullw');
        twitter_description.addEventListener('input', (e) => {
            this.editSubValue('twitter', 'description', e.target.value);
        });
        twitter_description.setAttribute('maxlength', 160);
        twitter_form_group_description.appendChild(twitter_description_label);
        twitter_form_group_description.appendChild(twitter_description);

        const twitter_form_group_card = Builder.div('form-group');
        twitter_body.appendChild(twitter_form_group_card);
        const twitter_card_label = Builder.label('Card type');
        const twitter_card = Builder.select(
            'Twitter card type...',
            [
                {value: 'summary', label: 'Summary'},
                {value: 'summary_large_image', label: 'Summary large image'},
                {value: 'app', label: 'App'},
                {value: 'player', label: 'Player'},
            ],
            this.page?.seo?.twitter?.card,
            (value) => {
                this.editSubValue('twitter', 'card', value);
            },
            false,
            '',
            'flex-1'
        );
        twitter_form_group_card.appendChild(twitter_card_label);
        twitter_form_group_card.appendChild(twitter_card.getElement());


        container.appendChild(twitter_container);

        this.reset_twitter = () => {
            twitter_title.value = this.page?.seo?.twitter?.title || '';
            twitter_description.value = this.page?.seo?.twitter?.description || '';
            twitter_card.setValue(this.page?.seo?.twitter?.card);
            const media = this.page?.seo?.twitter?.image
            if (media)
                twitter_image.setMedia(media);
            else
                twitter_image.reset();
        };
    }

    save() {
        const payload = JSON.stringify(this.page.seo)
        const url = '/admin/api/page/seo/save/' + this.page.id;

        const headers = {
            'Content-Type': 'application/json',
        };

        fetch(url, {
            method: 'POST',
            headers: headers,
            body: payload,
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (data.success) {
                this.backup = JSON.parse(JSON.stringify(this.page.seo));
                this.actions_el.classList.remove('active');
                Toast.success(data.message);
            } else {
                Toast.error(data.message || 'Error saving page SEO');
            }
        })
    }
}