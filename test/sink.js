'use strict';

const stream = require('readable-stream');
const Sink = require('../');
const tap = require('tap');


tap.test('constructor() - no value for "fileDir" argument - should throw', (t) => {
    t.throws(() => {
        new Sink(); // eslint-disable-line
    }, new Error('"fileDir" is missing'));
    t.end();
});

tap.test('constructor() - has value for "fileDir" argument - should be of Sink Class type', (t) => {
    t.type(new Sink('./'), Sink);
    t.end();
});


tap.test('.reader() - no value for "fileName" argument - should throw', (t) => {
    const sink = new Sink('./test/mock/');
    t.throws(() => {
        const source = sink.reader(); // eslint-disable-line
    }, new Error('"fileName" is missing'));
    t.end();
});

tap.test('.reader() - read non-existing file - should emit "file not found" event', (t) => {
    const sink = new Sink('./test/mock/');
    const source = sink.reader('feed.b.json');
    source.on('file not found', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read non-existing file - should emit (inherited) "error" event', (t) => {
    const sink = new Sink('./test/mock/');
    const source = sink.reader('feed.b.json');
    source.on('error', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read existing file - should emit "file found" event', (t) => {
    const sink = new Sink('./test/mock/');
    const source = sink.reader('feed.a.json');
    source.on('file found', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read existing file - should emit (inherited) "open" event', (t) => {
    const sink = new Sink('./test/mock/');
    const source = sink.reader('feed.a.json');
    source.on('open', () => {
        t.assert(true);
        t.end();
    });
});

tap.test('.reader() - read existing file - should emit (inherited) "open" event', (t) => {
    const sink = new Sink('./test/mock/');
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

    const sink = new Sink('./test/mock/');
    const source = sink.reader('feed.a.json');

    source.on('file found', () => {
        source.pipe(dest);
    });

    dest.on('finish', () => {
        t.assert(dest._data);
        t.end();
    });
});
