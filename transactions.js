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

const screenCapture = (url, args = {}) => {

    return new Promise(async (resolve, reject) => {
        // Launcher Chrome
        const browser = await puppeteer.launch();

        // Extract used Devtools domains
        const page = await browser.newPage();

        // Emulate iPhone6
        await page.emulate(iPhone);

        // Monitor Console, Response and Error Events
        page.on('console', (...args) => console.debug(...args));
        page.on('error', err => {
            log.error('Cannot connect to browser:', err);
            browser.close();
            reject(err);
        });

        // Navigate to target page
        await page.goto(url, { waitUntil: 'load' });

        setTimeout(async () => {
            // Evaluate Script to Get Widget Rect & Html
            const script = `(${screenshot.toString()}).apply(this);`;
            const result = await page.evaluate(script, args);
            log.debug('result', result);

            // combine style into html
            const html = result.html;

            // take screenshot & return htmlContent
            const rect = JSON.parse(result.rect);
            // log.debug('rect', rect);
            for (var id in rect) {
                const viewport = {
                    width: rect[id].width,
                    height: rect[id].height,
                    x: rect[id].left,
                    y: rect[id].top,
                };
                const data = await page.screenshot({ type: 'jpeg', clip: viewport });
                const buffer = new Buffer(data, 'base64');
                fs.writeFileSync(`${imgDir}/${id}.jpeg`, buffer, 'base64');
            }

            // log.debug('html', html);

            browser.close();
            resolve(html);
        }, 5000);


    });
};

module.exports = {
    screenCapture
};
