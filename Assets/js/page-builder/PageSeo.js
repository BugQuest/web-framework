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
    }

    render() {
        const accordeon_meta = Builder.accordion('Meta');
        this.element.appendChild(accordeon_meta.accordeon);
        this.renderMeta(accordeon_meta.accordeon_content);

        //og
        const accordeon_og = Builder.accordion('Open Graph');
        this.element.appendChild(accordeon_og.accordeon);
        const og_editor = new OpenGraphEditor(accordeon_og.accordeon_content);
        // this.renderOg(accordeon_og.accordeon_content);

        //twitter / x
        const accordeon_twitter = Builder.accordion('Twitter / X');
        this.element.appendChild(accordeon_twitter.accordeon);
        this.renderTwitterX(accordeon_twitter.accordeon_content);

        //structured data
        const accordeon_structured_data = Builder.accordion('Structured Data');
        this.element.appendChild(accordeon_structured_data.accordeon);

        const structured_data_editor = new StructuredDataEditor(accordeon_structured_data.accordeon_content);
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
        const meta_title = Builder.input_text(this.page?.title || 'Meta title...', this.page?.seo?.meta_title, 'flex-1');
        meta_form_group_title.appendChild(meta_title_label);
        meta_form_group_title.appendChild(meta_title);

        const meta_form_group_description = Builder.div('form-group');
        meta_body.appendChild(meta_form_group_description);
        const meta_description_label = Builder.label('Description');
        const meta_description = Builder.textarea('Meta description...', this.page?.seo?.meta_description, 'fullw');
        meta_description.setAttribute('maxlength', 160);
        meta_form_group_description.appendChild(meta_description_label);
        meta_form_group_description.appendChild(meta_description);

        const meta_form_group_keywords = Builder.div('form-group');
        meta_body.appendChild(meta_form_group_keywords);
        const meta_keywords = Builder.keywords('Meta Keywords', 'Ajouter un mot clé...', this.page?.seo?.meta_keywords.split(','), null, 'fullw');
        meta_form_group_keywords.appendChild(meta_keywords.getElement());

        container.appendChild(meta_container);
    }

    renderOg(container) {
        const og_container = Builder.div("container-form");
        const og_header = Builder.div('form-header');
        const og_header_title = Builder.h2('Open Graph', 'form-title')
        og_header.appendChild(og_header_title);

        const og_body = Builder.div('form-body');
        og_container.appendChild(og_header);
        og_container.appendChild(og_body);

        const og_form_group_title = Builder.div('form-group');
        og_body.appendChild(og_form_group_title);
        const og_title_label = Builder.label('Title');
        const og_title = Builder.input_text(this.page?.title || 'Open Graph title...', this.page?.seo?.og_title, 'flex-1');
        og_form_group_title.appendChild(og_title_label);
        og_form_group_title.appendChild(og_title);
        const og_image = new MediaBlock(
            'og_image',
            'Open Graph image',
            this.page?.seo?.og_image,
            {
                description: 'Image to use for Open Graph',
                mimeTypes: ['image/jpeg', 'image/png', 'image/gif']
            },
            (value) => {
                this.page.seo.og_image = value;
            },
        );
        og_image.render(og_form_group_title);

        const og_form_group_description = Builder.div('form-group');
        og_body.appendChild(og_form_group_description);
        const og_description_label = Builder.label('Description');
        const og_description = Builder.textarea('Open Graph description...', this.page?.seo?.og_description, 'fullw');
        og_description.setAttribute('maxlength', 160);
        og_form_group_description.appendChild(og_description_label);
        og_form_group_description.appendChild(og_description);


        const og_form_group_type = Builder.div('form-group');
        og_body.appendChild(og_form_group_type);
        const og_type_label = Builder.label('Type');
        const og_type = Builder.select(
            'Open Graph type...',
            [
                {value: 'website', label: 'Website'},
                {value: 'article', label: 'Article'},
                {value: 'profile', label: 'Profile'},
            ],
            this.page?.seo?.og_type,
            (value) => {
                this.page.seo.og_type = value;
            },
            false,
            '',
            'flex-1'
        );
        og_form_group_type.appendChild(og_type_label);
        og_form_group_type.appendChild(og_type.getElement());

        container.appendChild(og_container);
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
        const twitter_title = Builder.input_text(this.page?.title || 'Twitter title...', this.page?.seo?.twitter_title, 'flex-1');
        twitter_form_group_title.appendChild(twitter_title_label);
        twitter_form_group_title.appendChild(twitter_title);

        const twitter_image = new MediaBlock(
            'twitter_image',
            'Twitter image',
            this.page?.seo?.twitter_image,
            {
                description: 'Image to use for Twitter',
                mimeTypes: ['image/jpeg', 'image/png', 'image/gif']
            },
            (value) => {
                this.page.seo.twitter_image = value;
            },
        );
        twitter_image.render(twitter_form_group_title);

        const twitter_form_group_description = Builder.div('form-group');
        twitter_body.appendChild(twitter_form_group_description);
        const twitter_description_label = Builder.label('Description');
        const twitter_description = Builder.textarea('Twitter description...', this.page?.seo?.twitter_description, 'fullw');
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
            this.page?.seo?.twitter_card,
            (value) => {
                this.page.seo.twitter_card = value;
            },
            false,
            '',
            'flex-1'
        );
        twitter_form_group_card.appendChild(twitter_card_label);
        twitter_form_group_card.appendChild(twitter_card.getElement());


        container.appendChild(twitter_container);
    }
}