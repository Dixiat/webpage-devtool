// import modules
const koa = require('koa');

const log = require('./log.js');

const port = 3000,
      app = new koa();

// import middlewares
const bodyParser = require('koa-bodyparser');
const staticFile = require('koa-static');

const router = require('./router.js');

app.use(bodyParser({ encode: 'utf8' }));
app.use(router());
app.use(staticFile('images/screenshots'));

app.listen(port, () => {
    log.info(`App listens at port ${port}...`);
});