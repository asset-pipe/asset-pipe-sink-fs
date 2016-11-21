"use strict";

const JSONStream = require('JSONStream');
const common = require('asset-pipe-common');
const stream = require('readable-stream');
const assert = require('assert');
const path = require('path');
const fs = require('fs');



const SinkFs = module.exports = function (fileDir) {
    if (!(this instanceof SinkFs)) return new SinkFs(fileDir);
    assert(fileDir, '"fileDir" must be provided');

    this.fileDir = fileDir;
};



SinkFs.prototype.writer = function (fileType, callback) {
    const temp = path.join(this.fileDir, common.createTemporaryFilename(fileType));
    const hasher = (fileType === 'json') ? new common.SourceHasher() : new common.FileHasher();
    const parser = (fileType === 'json') ? JSONStream.parse('*') : new stream.PassThrough();
    const proxy = new stream.PassThrough();
    

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
