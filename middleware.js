const log = require('./log.js');

const logDivider = async (ctx, next) => {
    log.newline();
    await next(ctx);
};

module.exports = {
    logDivider
};