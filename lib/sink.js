'use strict';

const EventEmitter = require('events');
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
        const hasher = (type === 'json') ? new common.IdHasher() : new common.FileHasher();
        const parser = (type === 'json') ? JSONStream.parse('*') : new stream.PassThrough();

        const fileStream = fs.createWriteStream(temp);
        fileStream.on('finish', () => {
            const id = hasher.hash;
            const file = `${id}.${type}`;
            fs.rename(temp, path.join(options.path, file), (error) => {
                if (error) {
                    return this.emit('file not saved', error);
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

        fileStream.on('error', (error) => {
            this.emit('error', error);
        });

        this.pipe(parser).pipe(hasher);
        this.pipe(fileStream);
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
                this.emit('file not found', error);
            }
        });
    }
}


module.exports = class SinkFs extends EventEmitter {
    constructor (options = {}) {
        super();
        assert(options.path, '"options.path" is missing');
        this.name = 'asset-pipe-sink-fs';
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
