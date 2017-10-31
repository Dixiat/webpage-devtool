// import modules
const opts = require('opts');
const fs = require('fs');

class Utils {
    constructor() {
        /* polyfill */
        // @function padStart
        if (!String.prototype.padStart) {
            String.prototype.padStart = function padStart(targetLength,padString) {
                targetLength = targetLength>>0; // floor if number or convert non-number to 0;
                padString = String(padString || ' ');
                if (this.length > targetLength) {
                    return String(this);
                }
                else {
                    targetLength = targetLength - this.length;
                    if (targetLength > padString.length) {
                        padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
                    }
                    return padString.slice(0, targetLength) + String(this);
                }
            };
        }

        /* define args */
        this._options = [
            {
                short: 'p',
                long: 'port',
                description: 'the port to connect to',
                value: true
            }
        ];
        this._opts = opts;

        /* init */
        this._opts.parse(this._options);
    }

    padding(str, length, padStr) {
        if (typeof str !== 'string') {
            str = str.toString();
        }

        return str.padStart(length, padStr);
    }

    getTimeStr() {
        const time = new Date(Date.now());
        const timeStr = this.padding(time.getFullYear(), 4, '0') + '-'
                      + this.padding(time.getMonth() + 1, 2, '0') + '-'
                      + this.padding(time.getDate(), 2, '0') + ' '
                      + this.padding(time.getHours(), 2, '0') + ':'
                      + this.padding(time.getMinutes(), 2, '0') + ':'
                      + this.padding(time.getSeconds(), 2, '0');

        return timeStr;
    }

    getValue(obj, key, val = null) {
        if (obj[key] === undefined) {
            if (val === null) {
                throw new Error('missing parameter ' + key);
            } else {
                return val;
            }
        }
        return obj[key];
    }

    getOpts(key, defaultValue) {
        return this._opts.get(key) || defaultValue;
    }

    createDirs(...dirnames) {
        for (let dirname of dirnames) {
            const dirs = dirname && dirname.split('/');
            if (!fs.existsSync(dirname) && dirs) {
                this.createDirs(dirs.slice(0, dirs.length - 1).join('/'));
                fs.mkdirSync(dirname);
            }
        }
    }
}

module.exports = new Utils();