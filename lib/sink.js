'use strict';

const JSONStream = require('JSONStream');
const common = require('asset-pipe-common');
const stream = require('readable-stream');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');


class WriteStream extends stream.PassThrough {
    constructor (options = {}, type) {
        super();

        const temp = path.join(os.tmpdir(), common.createTemporaryFilename(type));
        const hasher = (type === 'json') ? new common.SourceHasher() : new common.FileHasher();
        const parser = (type === 'json') ? JSONStream.parse('*') : new stream.PassThrough();

        const file = fs.createWriteStream(temp);
        file.on('finish', () => {
            const id = hasher.hash;
            const file = `${id}.${type}`;
            fs.rename(temp, path.join(options.path, file), (error) => {
                if (error) {
                    return this.emit('file not saved');
                }
                this.emit('file saved', id, file);
            });
        });

        hasher.on('error', (error) => {
            this.emit('error', error);
        });

        parser.on('error', (error) => {
            this.emit('error', error);
        });

        file.on('error', (error) => {
            this.emit('error', error);
        });

        this.pipe(parser).pipe(hasher);
        this.pipe(file);
    }
}


class ReadStream extends fs.createReadStream {
    constructor (...args) {
        super(...args);
        this.on('open', () => {
            this.emit('file found');
        });
        this.on('error', (error) => {
            if (error.code === 'ENOENT') {
                this.emit('file not found');
            }
        });
    }
}


module.exports = class SinkFs {
    constructor (options = {}) {
        assert(options.path, '"options.path" is missing');
        this.options = Object.assign({}, options);
    }

    writer (type) {
        assert(type, '"type" is missing');
        return new WriteStream(this.options, type);
    }

    reader (file) {
        assert(file, '"file" is missing');
        return new ReadStream(path.join(this.options.path, file));
    }
};
