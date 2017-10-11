//import modules
const utils = require('./utils.js');

class Log {
    constructor() {
        this.logColor = {
            DEBUG: '\x1b[36m',  // cyan
            INFO: '\x1b[34m',   // blue
            WARN: '\x1b[33m',   // yellow
            ERROR: '\x1b[31m',  // red
            FATAL: '\x1b[35m'   // carmine
        };
    }

    output(level, data, args) {
        const time = `${[utils.getTimeStr()]}`,
              hint = `(\x1b[1m${this.logColor[level]}${level}\x1b[0m)`;

        console.log(time, hint, data, ...args);
    }

    debug(data, ...args) { this.output('DEBUG', data, args); }
    info(data, ...args) { this.output('INFO', data, args); }
    warn(data, ...args) { this.output('WARN', data, args); }
    error(data, ...args) { this.output('ERROR', data, args); }
    fatal(data, ...args) { this.output('FATAL', data, args); }
}

module.exports = new Log();