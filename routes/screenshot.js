// import modules
const cheerio = require('cheerio');
const path = require('path');

const log = require('../log.js');
const { getValue } = require('../utils.js');
const { screenCapture } = require('../transactions.js');
const { spliceImage } = require('../jimp.js');

const route4screenshot = async (ctx, next) => {
    try {
        const url = getValue(ctx.request.body, 'url');
        const content = await screenCapture(url);

        const $ = cheerio.load(content);

        let imgs = $('img');
        let imgPath = '';
        if (imgs.length > 1) {
            let fpath = path.resolve(__dirname, '../');
            let imgList = imgs.map((idx, element) => {
                return $(element).attr('data-src');
            }).get();
            imgPath = await spliceImage(fpath, imgList, 'jpeg', '/images/screenshots');
        } else {
            imgPath = imgs.attr('data-src');
        }

        log.info('ScreenCapture successful!');
        ctx.response.body = { url: imgPath };
    } catch(error) {
        log.error('ScreenCapture error:', error);
        ctx.response.body = { errcode: -1, errmsg: error.message };
    }
};

module.exports = {
    'POST /screenshot': route4screenshot
};