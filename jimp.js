const jimp = require('jimp');
const { uuid } = require('./utils');

/**
 * 新建图像(默认背景为白色)
 * @function
 * @param {Number} width - 新建图像宽度
 * @param {Number} height - 新建图像高度
 * @returns {Promise}
 */
const createImage = (width, height) => {
    return new Promise((resolve, reject) => {
        new jimp(width, height, 0xFFFFFFFF, (error, image) => {
            error && reject(error);
            resolve(image);
        });
    });
};

/**
 * 读取图片文件
 * @function
 * @param {String} path - 单张图片路径
 * @returns {Promise}
 */
const getImage = path => {
    return new Promise((resolve, reject) => {
        jimp.read(path, (error, image) => {
            error && reject(error);
            resolve(image);
        });
    });
};

/**
 * 遍历文件名数组读取所有图片文件
 * @function
 * @param {String} [path=__dirname] - 工作目录路径
 * @param {Array} fileList - 文件名列表
 * @returns {promise}
 */
const getAllImages = (path = __dirname, fileList) => {
    return new Promise((resolve, reject) => {
        const promises = fileList.map(f => {
            return getImage(`${path}/${f}`);
        });
        Promise.all(promises).then(images => {
            resolve(images);
        }).catch(error => {
            reject(error);
        });
    });
};

/**
 * 获取图片尺寸对象
 * @function
 * @param {Jimp} image - 图片对象
 * @returns {Object}
 */
const getImageSize = image => {
    if (image && image.bitmap) {
        return {
            width: image.bitmap.width || 0,
            height: image.bitmap.height || 0
        };
    }
};

/**
 * 图片写至文件
 * @function
 * @param {Jimp} image - 图片对象
 * @param {String} filename - 输出图片路径
 * @returns {Promise}
 */
const writeImage = (image, filename) => {
    if (image) {
        return new Promise((resolve, reject) => {
            image.write(filename, (error, image) => {
                error && reject(error);
                resolve(filename);
            });
        });
    }
};

/**
 * 拼接图片并返回拼接后图片路径
 * @function
 * @param {String} path - 工作目录路径
 * @param {Array} fileList - 拼接图片路径列表
 * @param {String} ext - 拼接图片扩展名
 * @param {String} dir - 输出图片文件夹路径
 * @returns {String}
 */
const spliceImage = async (path, fileList, ext = 'jpeg', dir) => {
    const images = await getAllImages(path, fileList);
    let dstImageHeight = 0,
        dstImageWidth = 0;
    const imagesHeights = [0, ...images.map(image => {
        const { width, height } = getImageSize(image);
        dstImageWidth = dstImageWidth > width ? dstImageWidth : width;
        dstImageHeight += height;
        return height;
    })];
    const dstImage = await createImage(dstImageWidth, dstImageHeight);
    for (let i = 0, offsetX, offsetY = 0; i < images.length; i++) {
        const { width } = getImageSize(images[i]);
        offsetY += imagesHeights[i];
        offsetX = (dstImageWidth - width) / 2;
        dstImage.blit(images[i], offsetX, offsetY);
    }

    const id = uuid();
    await writeImage(dstImage, `${path}${dir ? dir : ''}/${id}.${ext}`);

    const dstImagePath = `${dir ? dir : path}/${id}.${ext}`;
    return dstImagePath;
};

module.exports = {
    createImage,
    getImage,
    getAllImages,
    getImageSize,
    writeImage,
    spliceImage,
};