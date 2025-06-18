import BQMap from '@framework/js/map/BQMap';

document.addEventListener('DOMContentLoaded', function () {
    //get all elements with class __map_block
    const mapBlocks = document.querySelectorAll('.__map_block');
    // Loop through each map block element
    mapBlocks.forEach(function (mapBlock) {
        const options = mapBlock.dataset.options ? JSON.parse(mapBlock.dataset.options) : {};
        // Create a new BQMap instance for each map block
        const bqMap = new BQMap(mapBlock, options);
    });

});