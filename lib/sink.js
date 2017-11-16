'use strict';

const EventEmitter = require('events');
const JSONStream = require('JSONStream');
const common = require('asset-pipe-common');
const stream = require('readable-stream');
const assert = require('assert');
const { join, basename, dirname } = require('path');
const fs = require('fs');
const os = require('os');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class WriteStream extends stream.PassThrough {
    constructor(rootPath, type) {
        super();

        const temp = join(os.tmpdir(), common.createTemporaryFilename(type));
        const hasher =
            type === 'json' ? new common.IdHasher() : new common.FileHasher();
        const parser =
            type === 'json' ? JSONStream.parse('*') : new stream.PassThrough();

        const fileStream = fs.createWriteStream(temp);
        fileStream.on('finish', () => {
            const id = hasher.hash;
            const file = `${id}.${type}`;
            fs.rename(temp, join(rootPath, file), error => {
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
        const file = basename(args[0]);
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
    constructor({ path } = {}) {
        super();
        assert(path, '"options.path" is missing');
        this.name = 'asset-pipe-sink-fs';
        this.rootPath = path;
    }

    joinPath(fileName) {
        return join(this.rootPath, fileName);
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
            const file = await readFile(this.joinPath(fileName), 'utf8');
            if (file) {
                return file;
            }
        } catch (e) {}
        throw new Error(`No file with fileName "${fileName}"`);
    }

    async set(fileName, fileContent) {
        this.assertFileName(fileName);
        assert(fileContent, '"fileContent" is missing');
        const target = this.joinPath(fileName);
        await mkdirp(dirname(target));
        await writeFile(target, fileContent, 'utf8');
    }

    async has(fileName) {
        this.assertFileName(fileName);
        try {
            await access(
                this.joinPath(fileName),
                fs.constants.R_OK | fs.constants.W_OK
            );
            return true;
        } catch (e) {}
        return false;
    }

    async dir(directoryName = '/') {
        const resolveTargetDirName = this.joinPath(directoryName);
        try {
            const dir = await readdir(resolveTargetDirName);
            if (dir.length === 0) {
                throw new Error();
            }
            let results = await Promise.all(
                dir.map(relativePath =>
                    stat(join(resolveTargetDirName, relativePath)).then(
                        stats => {
                            if (stats.isDirectory()) {
                                // filter out
                                return;
                            }

                            return this.get(
                                join(directoryName, relativePath)
                            ).then(content => ({
                                fileName: relativePath,
                                content,
                            }));
                        }
                    )
                )
            );
            results = results.filter(Boolean);
            if (results.length === 0) {
                throw new Error();
            }
            return results;
        } catch (e) {
            throw new Error(
                `Missing folder with name "${directoryName}" or empty result`
            );
        }
    }

    writer(type) {
        assert(type, '"type" is missing');
        return new WriteStream(this.rootPath, type);
    }

    reader(fileName) {
        this.assertFileName(fileName);
        return new ReadStream(this.joinPath(fileName));
    }
};
