const screenshot = () => {
    var rects = [],
        heightUnit = 8192;
    try {
        let content = document.body;
        const rect =  content.getBoundingClientRect();
        rects.push(rect);

        var rectLength = rect.height = Math.max(rect.height, content.scrollHeight);

        if (rectLength > heightUnit) {  // 截图长度超过heightUnit会造成截图不完整的问题
            var bottom = 0, top = 0;

            for (var i = 0; i < rectLength; i += heightUnit) {
                var height = rectLength - i;
                if (height > heightUnit) {
                    height = heightUnit;
                }

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

                rects.push(clipRect);
            }

            rects.shift();
        }

        return {
            rects: JSON.stringify(rects),
        };
    } catch (error) {
        console.log(error);
        return {
            rects: '',
            error: error.toString()
        };
    }
};

module.exports = {
    screenshot
};