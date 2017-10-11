const fs = require('fs'),
      path = require('path');

const log = require('./log.js');

function addMapping(router, mapping) {
    for (const req in mapping) {
        switch (true) {
        case req.startsWith('GET'):
            var path = req.substring(4);
            router.get(path, mapping[req]);
            log.info(`Register req mapping: ${req}`);
            break;
        case req.startsWith('POST'):
            var path = req.substring(5);
            router.post(path, mapping[req]);
            log.info(`Register req mapping: ${req}`);
            break;
        default:
            log.error(`Invalid request: ${req}`);
        }
    }
}

function addRoutes(router, dir) {
    const fpath = path.resolve(__dirname, dir);
    const files = fs.readdirSync(fpath);
    const js_files = files.filter(f => {
        return f.endsWith('.js');
    });

    for (const f of js_files) {
        log.info(`Process controller: ${f}`);
        const mapping = require(`${fpath}/${f}`);
        addMapping(router, mapping);
    }
}

module.exports = dir => {
    const
        routes_dir = dir || './routes',
        router = require('koa-router')();

    addRoutes(router, routes_dir);

    return router.routes();
};