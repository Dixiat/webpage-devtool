// import modules
const log = require('../log.js');
const { getValue } = require('../utils.js');
const { googleSearch } = require('../transactions.js');

const route4search = async (ctx, next) => {
    try {
        const query = getValue(ctx.request.body, 'query');
        const searchResults = await googleSearch(query);

        log.info('Search result:', searchResults);
        ctx.response.body = JSON.stringify(searchResults);
    } catch (error) {
        log.error('Search error:', error.message);
        ctx.response.body = { errmsg: error.message };
    }
};

module.exports = {
    'POST /search': route4search
};