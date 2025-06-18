export default class BQMapIcon {
    constructor(url = 'div',
                content = '<div class="marker-icon"></div>',
                size = [40, 40],
                anchor = [20, 20],
                popup_anchor = [0, -20]) {
        this.url = url;
        this.content = content;
        this.size = size;
        this.anchor = anchor;
        this.popup_anchor = popup_anchor;
    }
}