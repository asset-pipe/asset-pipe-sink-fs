"use strict";

const stream = require('stream');
const Sink = require('../');
const tap = require('tap');
const fs = require('fs');




const sourceStream = (arr) => {
    return new stream.Readable({
        objectMode : false,
        read: function (n) {
            arr.forEach((chunk) => {
                this.push(chunk);
            });
            this.push(null);
        }
    });
}

const a = ['a','b','c'];
const b = ['d', 'a','b','c'];


tap.test('not a real test', (t) => {
    const sink = new Sink('./');
    const file = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json', (filename) => {
        console.log(filename);
        t.end();
    });
    file.pipe(dest);
});
