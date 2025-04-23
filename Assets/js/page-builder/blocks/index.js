import mediaSelectorType from './trait/media-selector';

import customImageType from './type/custom-image';
import gridType from './type/grid';

import container from './structure/container';
import wrapper from './structure/wrapper';
import section from './structure/section';
import twoColumn from './structure/two-column';
import threeColumn from './structure/three-column';
import grid from './structure/grid';

import heading from './heading';
import paragraph from './paragraph';
import image from './image';
import button from './button';


export default function loadBasicBlocks(editor) {
    //Trais
    mediaSelectorType(editor);

    //types
    customImageType(editor);
    gridType(editor);

    // Structure blocks
    container(editor);
    wrapper(editor);
    section(editor);
    twoColumn(editor);
    threeColumn(editor);
    grid(editor);


    // Basic blocks
    heading(editor);
    paragraph(editor);
    image(editor);
    button(editor);
}

