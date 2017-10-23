// import modules
const uuid = require('uuid/v1');
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
    browserInstance = await puppeteer.launch({ headless: true });
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
        // page.on('console', (...args) => console.debug(...args));
        page.on('error', async (err) => {
            log.error('Cannot connect to browser:', err);
            await page.close();
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
            await page.close();
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
                // Evaluate Script to Get Page Rect
                const result = await page.evaluate(screenshot, args);

                // Take Screenshot
                const screenshots = [];
                const rects = JSON.parse(result.rects);
                // log.debug('rects', rects);
                for (var id in rects) {
                    const viewport = {
                        width: rects[id].width,
                        height: rects[id].height,
                        x: rects[id].left,
                        y: rects[id].top,
                    };
                    const path = `${imgDir}/${uuid()}.jpeg`;
                    await page.screenshot({ type: 'jpeg', path, clip: viewport });
                    screenshots.push(path);
                }

                await page.close();
                await browser.disconnect();
                resolve(screenshots);
            }, 1 * 1000);
        }
    });
};

const googleSearch = query => {
    let searchResult = [];

    return new Promise(async (resolve, reject) => {
        log.info(`Google search: <${query}>`);
        const browser = await puppeteer.connect({ browserWSEndpoint });
        const page = await browser.newPage();

        try {
            await page.goto('https://www.google.co.jp', { waitUntil: 'load', timeout: 30 * 1000});

            await page.focus('input#lst-ib');
            await page.keyboard.type(query, { delay: 100 });
            await page.keyboard.press('Enter');

            await page.waitForNavigation({ waitUntil: 'load' });

            searchResult = await page.$$eval('.srg .rc .r a', links => {
                let result = [];
                for (const link of links) {
                    result.push({ text: link.innerText, url: link.href });
                }
                return result;
            });

            resolve(searchResult);
        } catch (error) {
            reject(error);
        }

        await page.close();
        await browser.disconnect();
    });
};

module.exports = {
    screenCapture,
    googleSearch
};
