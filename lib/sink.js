'use strict';

const EventEmitter = require('events');
const JSONStream = require('JSONStream');
const common = require('asset-pipe-common');
const stream = require('readable-stream');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

class WriteStream extends stream.PassThrough {
    constructor(options = {}, type) {
        super();

        const temp = path.join(
            os.tmpdir(),
            common.createTemporaryFilename(type)
        );
        const hasher =
            type === 'json' ? new common.IdHasher() : new common.FileHasher();
        const parser =
            type === 'json' ? JSONStream.parse('*') : new stream.PassThrough();

        const fileStream = fs.createWriteStream(temp);
        fileStream.on('finish', () => {
            const id = hasher.hash;
            const file = `${id}.${type}`;
            fs.rename(temp, path.join(options.path, file), error => {
                if (error) {
                    return this.emit('file not saved', error);
                }
                this.emit('file saved', id, file);
            });
        });

        hasher.on('error', error => {
            this.emit('error', error);
        });

        parser.on('error', error => {
            this.emit('error', error);
        });

        fileStream.on('error', error => {
            this.emit('error', error);
        });

        this.pipe(parser).pipe(hasher);
        this.pipe(fileStream);
    }
}

class ReadStream extends fs.createReadStream {
    constructor(...args) {
        super(...args);
        const file = path.parse(args[0]).base;
        this.on('open', () => {
            this.emit('file found', file);
        });
        this.on('error', error => {
            if (error.code === 'ENOENT') {
                this.emit('file not found', file);
            }
        });
    }
}

module.exports = class SinkFs extends EventEmitter {
    constructor(options = {}) {
        super();
        assert(options.path, '"options.path" is missing');
        this.name = 'asset-pipe-sink-fs';
        this.options = Object.assign({}, options);
    }

    getFileName(fileName) {
        return path.join(this.options.path, fileName);
    }

    assertFileName(fileName) {
        assert(
            typeof fileName === 'string',
            `Expected "fileName" to be a string. Instead got ${fileName}`
        );
    }

    async get(fileName) {
        this.assertFileName(fileName);
        try {
            const file = await readFile(this.getFileName(fileName), 'utf8');
            if (file) {
                return file;
            }
        } catch (e) {}
        throw new Error(`No file with fileName "${fileName}"`);
    }

    async set(fileName, fileContent) {
        this.assertFileName(fileName);
        assert(fileContent, '"fileContent" is missing');
        await writeFile(this.getFileName(fileName), fileContent, 'utf8');
    }

    async has(fileName) {
        this.assertFileName(fileName);
        try {
            await access(
                this.getFileName(fileName),
                fs.constants.R_OK | fs.constants.W_OK
            );
            return true;
        } catch (e) {}
        return false;
    }

    writer(type) {
        assert(type, '"type" is missing');
        return new WriteStream(this.options, type);
    }

    reader(fileName) {
        this.assertFileName(fileName);
        return new ReadStream(this.getFileName(fileName));
    }
};
