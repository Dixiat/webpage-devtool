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
    let timeoutID,
        resources = {},
        receivedImages = 0,
        domImages = 0,
        isCapturing = false;

    return new Promise(async (resolve, reject) => {
        //Show up Screenshot Info
        log.info(`ScreenCapture - <${url}>`)

        // Connect Browser
        const browser = await puppeteer.connect({ browserWSEndpoint });

        // Extract Used Devtools Domains
        const page = await browser.newPage();

        // Emulate iPhone6
        await page.emulate(iPhone);

        // Monitor Console, Request and Error Events
        page.on('console', (...args) => console.debug(...args));
        page.on('error', async (err) => {
            log.error('Cannot connect to browser:', err);
            await browser.disconnect();
            reject(err);
            return;
        });
        page.on('request', request => {
            if (isCapturing) return;

            if (request.resourceType === 'image') {
                const { url } = request;
                resources[url] = true;
                timeoutID && clearTimeout(timeoutID);
            }
        })
        page.on('requestfinished', request => {
            if (isCapturing) return;

            const { resourceType, _response } = request,
                  { url } = _response;

            if (resourceType === 'image') {
                delete resources[url];
                receivedImages++;
                timeoutID && clearTimeout(timeoutID);
                if (timeoutID && !Object.keys(resources).length) {
                    initScreenshotTimeout();
                }
            }
        });

        // Navigate to Target Page
        try {
            await page.goto(url, { waitUntil: 'networkidle', networkIdleTimeout: 3 * 1000, timeout: 60 * 1000 });
        } catch (e) {
            await browser.disconnect();
            reject(e);
            return;
        }

        // Scroll to Load Image(Lazy-load)
        await page.evaluate(async () => {
            var i = 0;
            var scrollCount = Math.floor(document.body.scrollHeight / window.innerHeight);
            await new Promise((resolve, reject) => {
                var intervalID = setInterval(function() {
                    if (i >= scrollCount) {
                        window.scrollTo(0, 0);
                        clearInterval(intervalID);
                        resolve(true);
                        return;
                    }
                    window.scrollBy(0, window.innerHeight);
                    i++;
                }, 300);
            });
        });

        domImages = await page.$$eval('img', imgs => imgs.length);

        initScreenshotTimeout();

        function initScreenshotTimeout() {
            timeoutID = setTimeout(async () => {
                if (receivedImages < domImages) return;

                log.info('Start screen capturing...');
                isCapturing = true;
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
            }, 1 * 1000);
        }
    });
};

module.exports = {
    screenCapture
};
