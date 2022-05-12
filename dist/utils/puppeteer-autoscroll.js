"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, _reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
exports.default = autoScroll;
