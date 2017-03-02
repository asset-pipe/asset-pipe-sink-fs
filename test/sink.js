'use strict';

const stream = require('readable-stream');
const Sink = require('../');
const tap = require('tap');
const fs = require('fs');
const os = require('os');


tap.test('constructor() - no value for "options.path" argument - should throw', (t) => {
    t.throws(() => {
        new Sink(); // eslint-disable-line
    }, new Error('"options.path" is missing'));
    t.end();
});

tap.test('constructor() - has value for "options.path" argument - should be of Sink Class type', (t) => {
    t.type(new Sink({
        path: './',
    }), Sink);
    t.end();
});


tap.test('.writer() - no value for "type" argument - should throw', (t) => {
    const sink = new Sink({
        path: './test/.tmp/',
    });
    t.throws(() => {
        const dest = sink.writer(); // eslint-disable-line
    }, new Error('"type" is missing'));
    t.end();
});

tap.test('.writer() - save to non existing path - should emit "file not saved" event', (t) => {
    const sink = new Sink({
        path: './test/.nonExistingDirectory/',
    });
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file not saved', () => {
        t.assert(true);
        t.end();
    });
    source.pipe(dest);
});

tap.test('.writer() - save to existing path - should emit "file saved" event', (t) => {
    const sink = new Sink({
        path: os.tmpdir(),
    });
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', () => {
        t.assert(true);
        t.end();
    });
    source.pipe(dest);
});

tap.test('.writer() - on "file saved" - should have "id" and "file" on emitted event', (t) => {
    const sink = new Sink({
        path: os.tmpdir(),
    });
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', (id, file) => {
        t.assert(id);
        t.assert(file);
        t.end();
    });
    source.pipe(dest);
});


tap.test('.reader() - no value for "file" argument - should throw', (t) => {
    const sink = new Sink({
        path: './test/mock/',
    });
    t.throws(() => {
        const source = sink.reader(); // eslint-disable-line
    }, new Error('"file" is missing'));
    t.end();
});

tap.test('.reader() - read non-existing file - should emit "file not found" event', (t) => {
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.b.json');
    source.on('file not found', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read non-existing file - should emit (inherited) "error" event', (t) => {
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.b.json');
    source.on('error', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read existing file - should emit "file found" event', (t) => {
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');
    source.on('file found', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read existing file - should emit (inherited) "open" event', (t) => {
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');
    source.on('open', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read existing file - should emit (inherited) "open" event', (t) => {
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');
    source.on('open', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read existing file - should stream read file', (t) => {
    const dest = new stream.Writable({
        _data: false,
        write (chunk, encoding, next) {
            this._data += chunk;
            next();
        },
    });

    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');

    source.on('file found', () => {
        source.pipe(dest);
    });

    dest.on('finish', () => {
        t.assert(dest._data);
        t.end();
    });
});
