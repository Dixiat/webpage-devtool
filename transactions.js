// import modules
const fs = require('fs');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

const log = require('./log.js');

// import scripts
const { screenshot } = require('./scripts/screenshot.js');

// Args
const imgDir = 'images/screenshots';

// Launcher Chrome
let browserInstance, browserWSEndpoint;
(async () => {
    browserInstance = await puppeteer.launch();
    browserWSEndpoint = browserInstance.wsEndpoint();
    browserInstance.disconnect();
})();

const screenCapture = (url, args = {}) => {

    return new Promise(async (resolve, reject) => {
        // Connect Browser
        const browser = await puppeteer.connect({ browserWSEndpoint });

        // Extract Used Devtools Domains
        const page = await browser.newPage();

        // Emulate iPhone6
        await page.emulate(iPhone);

        // Monitor Console, Response and Error Events
        page.on('console', (...args) => console.debug(...args));
        page.on('error', async (err) => {
            log.error('Cannot connect to browser:', err);
            await browser.disconnect();
            reject(err);
            return;
        });

        // Navigate to Target Page
        try {
            await page.goto(url, { waitUntil: 'load', timeout: 60 * 1000 });
        } catch (e) {
            await browser.disconnect();
            reject(e);
            return;
        }

        setTimeout(async () => {
            log.info('Start screen capturing...');
            // Evaluate Script to Get Widget Rect & Html
            const result = await page.evaluate(screenshot, args);

            // Combine Style into Html
            const html = result.html;

            // Take Screenshot
            const rect = JSON.parse(result.rect);
            // log.debug('rect', rect);
            for (var id in rect) {
                const viewport = {
                    width: rect[id].width,
                    height: rect[id].height,
                    x: rect[id].left,
                    y: rect[id].top,
                };
                await page.screenshot({ type: 'jpeg', path: `${imgDir}/${id}.jpeg`, clip: viewport });
            }

            // log.debug('html', html);

            await browser.disconnect();
            resolve(html);
        }, 5000);
    });
};

module.exports = {
    screenCapture
};
