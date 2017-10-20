// import modules
const path = require('path');

const log = require('../log.js');
const { getValue } = require('../utils.js');
const { screenCapture } = require('../transactions.js');
const { spliceImage } = require('../jimp.js');

const route4screenshot = async (ctx, next) => {
    try {
        const url = getValue(ctx.request.body, 'url');
        const screenshots = await screenCapture(url);

        const fpath = path.resolve(__dirname, '../');
        const imgPath = await spliceImage(fpath, screenshots, 'jpeg', '/images/screenshots');

        log.info('ScreenCapture successful!');
        ctx.response.body = { url: imgPath };
    } catch(error) {
        log.error('ScreenCapture error:', error.message);
        ctx.response.body = { errcode: -1, errmsg: error.message };
    }
};

module.exports = {
    'POST /screenshot': route4screenshot
};