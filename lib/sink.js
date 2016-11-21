"use strict";

const JSONStream = require('JSONStream');
const common = require('asset-pipe-common');
const stream = require('readable-stream');
const crypto = require('crypto');
const assert = require('assert');
const path = require('path');
const fs = require('fs');



const SinkFs = module.exports = function (fileDir) {
    if (!(this instanceof SinkFs)) return new SinkFs(fileDir);
    assert(fileDir, '"fileDir" must be provided');

    this.fileDir = fileDir;
};



SinkFs.prototype.tempName = function (fileType) {
    const rand = Math.floor(Math.random() * 1000).toString();
    return 'tmp-' + Date.now().toString() + '-' + rand + '.' + fileType;
}



SinkFs.prototype.writer = function (fileType, callback) {
    const temp = path.join(this.fileDir, this.tempName(fileType));
    const parser = JSONStream.parse('*');

    const proxy = new stream.PassThrough();

    const hasher = new common.SourceHasher();

    const file = fs.createWriteStream(temp);
    file.on('finish', () => {
        const fileName = hasher.hash + '.' + fileType;
        fs.rename(temp, path.join(this.fileDir, fileName), () => {
            if (callback) {
                callback(fileName);
            }
        });
    });

    file.on('error', (error) => {
        console.log(error);
    });

    proxy.pipe(parser).pipe(hasher);
    proxy.pipe(file);

    return proxy;
};



SinkFs.prototype.reader = function (fileName, callback) {
    let from = this.fileDir + fileName;
    let file = fs.createReadStream(from);
    
    file.on('finish', () => {
        if (callback) {
            callback();
        }
    });

    return file;
};
