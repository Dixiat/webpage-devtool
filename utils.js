class Utils {
    constructor() {
        /* polyfill */
        // @function padStart
        if (!String.prototype.padStart) {
            String.prototype.padStart = function padStart(targetLength,padString) {
                targetLength = targetLength>>0; //floor if number or convert non-number to 0;
                padString = String(padString || ' ');
                if (this.length > targetLength) {
                    return String(this);
                }
                else {
                    targetLength = targetLength-this.length;
                    if (targetLength > padString.length) {
                        padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
                    }
                    return padString.slice(0,targetLength) + String(this);
                }
            };
        }
    }

    padding(str, length, padStr) {
        if (typeof str !== 'string') {
            str = str.toString();
        }

        return str.padStart(length, padStr);
    }

    getTimeStr() {
        const time = new Date(Date.now());
        const timeStr = this.padding(time.getFullYear(), 4) + '-'
                      + this.padding(time.getMonth() + 1, 2) + '-'
                      + this.padding(time.getDate(), 2) + ' '
                      + this.padding(time.getHours(), 2) + ':'
                      + this.padding(time.getMinutes(), 2) + ':'
                      + this.padding(time.getSeconds(), 2);

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
}


const padding = (str, length, padStr) => {
    if (typeof str !== 'string') {
        str = str.toString();
    }

    return str.padStart(length, padStr);
};

const getTimeStr = () => {
    const time = Date.now();
    const timeStr = padding(time.getFullYear(), 4) + '-'
                  + padding(time.getMonth() + 1, 2) + '-'
                  + padding(time.getDate(), 2) + ' '
                  + padding(time.getHours(), 2) + ':'
                  + padding(time.getMinutes(), 2) + ':'
                  + padding(time.getSeconds(), 2);

    return timeStr;
};

const getValue = (obj, key, val = null) => {
    if (obj[key] === undefined) {
        if (val === null) {
            throw new Error('missing parameter ' + key);
        } else {
            return val;
        }
    }
    return obj[key];
};

module.exports = new Utils();