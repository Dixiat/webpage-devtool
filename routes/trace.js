// import modules
const log = require('../log.js');
const { getValue } = require('../utils.js');
const { trace } = require('../transactions.js');

const route4trace = async (ctx, next) => {
    try {
        const url = getValue(ctx.request.body, 'url');
        const traceResult = await trace(url);

        log.info('Trace result:', traceResult);
        ctx.response.body = traceResult;
    } catch (error) {
        log.error('Trace error:', error.message);
        ctx.request.body = { errmsg: error.message };
    }
};

module.exports = {
    'POST /trace': route4trace
};