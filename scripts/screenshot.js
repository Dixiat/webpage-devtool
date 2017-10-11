const screenshot = () => {
    var widgetRectMap = {},
    heightUnit = 9000;
    try {
        let content = document.body,
            pid = uuid();
        const rect = widgetRectMap[pid] = content.getBoundingClientRect();

        var wrapper = document.createElement('section');
        var rectLength = rect.height;
        var img;
        if (rectLength > heightUnit) {  // 截图长度超过heightUnit会造成截图不完整的问题
            var bottom = 0, top = 0;

            for (var i = 0; i < rectLength; i += heightUnit) {
                var height = rect.height - i;
                if (height > heightUnit) {
                    height = heightUnit;
                }

                img = document.createElement('img');
                var id = uuid();
                img.setAttribute('data-src', '/images/screenshots/' + id + '.jpeg');
                img.style = 'display:block';
                wrapper.appendChild(img);

                top = bottom;
                bottom += height;

                var clipRect = {
                    top: top,
                    left: rect.left,
                    height: height,
                    width: rect.width,
                    bottom: bottom,
                    right: rect.right,
                };

                widgetRectMap[id] = clipRect;
            }

            delete widgetRectMap[pid];
        } else {
            img = document.createElement('img');
            img.setAttribute('data-src', '/images/screenshots/' + pid + '.jpeg');
            img.style = 'display: block';
            wrapper.appendChild(img);
        }

        return {
            rect: JSON.stringify(widgetRectMap),
            html: wrapper.innerHTML
        };
    } catch (error) {
        console.log(error);
        return {
            rect: '',
            html: '',
            error: error
        };
    }

    /* 内部函数定义 */
    function uuid() {
        var s = [];
        var hexDigits = '0123456789abcdef';
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = '-';

        var uuid = s.join('');
        return uuid;
    }
};

module.exports = {
    screenshot
};