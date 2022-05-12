"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const puppeteer_autoscroll_1 = __importDefault(require("./utils/puppeteer-autoscroll"));
const fs_1 = __importDefault(require("fs"));
const search = encodeURI('agro');
(async () => {
    console.log('start');
    const browser = await puppeteer_1.default.launch({ headless: true, devtools: false });
    const page = await browser.newPage();
    await page.goto(`https://play.google.com/store/search?q=${search}&c=apps`, { waitUntil: 'networkidle2' });
    await (0, puppeteer_autoscroll_1.default)(page);
    const links = await page.evaluate(() => {
        const alink = Array.from(document.querySelectorAll('.wXUyZd a'));
        return alink.map((a) => a.href);
    });
    const cleanedLinks = new Set(links);
    console.log('Total:', cleanedLinks.size);
    const apps = [];
    for (const link of cleanedLinks) {
        await page.goto(link, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);
        let title, channel, genre;
        let reviews = 0;
        let stars = 0;
        let lastUpdate = null;
        let installs = 0;
        try {
            title = await page.$eval('.AHFaub span', (item) => { return item.textContent; });
        }
        catch (e) {
            console.log(e);
        }
        try {
            channel = await page.$eval('.qQKdcc span:first-child a', (item) => { return item.textContent; });
        }
        catch (e) {
            console.log(e);
        }
        try {
            genre = await page.$eval('.qQKdcc span:last-child a', (item) => { return item.textContent; });
        }
        catch (e) {
            console.log(e);
        }
        try {
            reviews = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(1) > c-wiz:nth-child(1) > div > div.D0ZKYe > div > div.sIskre > div.jdjqLd > div.dNLKff > c-wiz > span > span:nth-child(1)', (item) => { return item.textContent?.replace('.', ''); });
        }
        catch (e) {
            console.log(e);
        }
        try {
            stars = await page.$eval('.BHMmbe', (item) => { return item.textContent?.replace(',', '.'); });
        }
        catch (e) {
            console.log(e);
        }
        // lastUpdate
        try {
            lastUpdate = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(3) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(1) > span > div > span', (item) => { return item.textContent; });
        }
        catch (e) {
            console.log(e);
        }
        if (lastUpdate === null) {
            try {
                lastUpdate = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(4) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(1) > span > div > span', (item) => { return item.textContent; });
            }
            catch (e) {
                console.log(e);
            }
        }
        // installs
        try {
            installs = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(4) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(3) > span > div > span', (item) => { return item.textContent?.replace('+', ''); });
        }
        catch (e) {
            console.log(e);
        }
        if (installs === 0) {
            try {
                installs = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(3) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(3) > span > div > span', (item) => { return item.textContent?.replace('+', ''); });
            }
            catch (e) {
                console.log(e);
            }
        }
        const content = `${title}; ${channel}; ${genre}; ${reviews}; ${stars}; ${lastUpdate}; ${installs}; ${link}\n`;
        fs_1.default.appendFileSync(`${decodeURI(search)}.csv`, content);
        apps.push({ title, channel, genre, reviews, stars, lastUpdate, installs, link });
    }
    console.log(apps);
    browser.close();
})();
