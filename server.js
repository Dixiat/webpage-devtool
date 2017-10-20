// import modules
const koa = require('koa');

const log = require('./log.js');
const utils = require('./utils.js');

const port = utils.getOpts('port', 3000),
      app = new koa();

// import middlewares
const bodyParser = require('koa-bodyparser');
const staticFile = require('koa-static');

const router = require('./router.js');

// use middlewares
app.use(bodyParser({ encode: 'utf8' }));
app.use(router());
app.use(staticFile(__dirname));

// start server
app.listen(port, () => {
    log.info(`App listens at port ${port}...`);
});