'use strict';

const Sink = require('../');
const tap = require('tap');
const fs = require('fs');
const { tmpdir } = require('os');


tap.test('not a real test', (t) => {
    const sink = new Sink(tmpdir());
    const file = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json', (filename) => {
        console.log(filename);
        t.end();
    });
    file.pipe(dest);
});


tap.test('another not a real test', (t) => {
    const sink = new Sink(tmpdir());
    const file = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('js', (filename) => {
        console.log(filename);
        t.end();
    });
    file.pipe(dest);
});
