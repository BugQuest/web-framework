import { ImageOptionsPage } from './components/options/ImageOptionsPage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const page = new ImageOptionsPage();
    await page.init();
});