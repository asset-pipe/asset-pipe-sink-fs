'use strict';

const JSONStream = require('JSONStream');
const common = require('asset-pipe-common');
const stream = require('readable-stream');
const assert = require('assert');
const path = require('path');
const fs = require('fs');


module.exports = class SinkFs {
    constructor (fileDir) {
        assert(fileDir, '"fileDir" is missing');
        this.fileDir = fileDir;
    }

    writer (fileType, callback) {
        const temp = path.join(this.fileDir, common.createTemporaryFilename(fileType));
        const hasher = (fileType === 'json') ? new common.SourceHasher() : new common.FileHasher();
        const parser = (fileType === 'json') ? JSONStream.parse('*') : new stream.PassThrough();
        const proxy = new stream.PassThrough();

        const file = fs.createWriteStream(temp);
        file.on('finish', () => {
            const id = hasher.hash;
            const fileName = `${id}.${fileType}`;
            fs.rename(temp, path.join(this.fileDir, fileName), () => {
                if (callback) {
                    callback(id, fileName);
                }
            });
        });

        file.on('error', (error) => {
            console.log(error);
        });

        proxy.pipe(parser).pipe(hasher);
        proxy.pipe(file);

        return proxy;
    }

    reader (fileName) {
        assert(fileName, '"fileName" is missing');
        const from = path.join(this.fileDir, fileName);

        class ReadStream extends fs.createReadStream {
            constructor (...args) {
                super(...args);
                this.on('open', () => {
                    this.emit('file found');
                });
                this.on('error', (error) => {
                    if (error.code === 'ENOENT') {
                        this.emit('file not found', error);
                    }
                });
            }
        }

        return new ReadStream(from);
    }
};
