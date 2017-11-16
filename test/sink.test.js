'use strict';

const stream = require('readable-stream');
const Sink = require('../');
const fs = require('fs');
const os = require('os');

function getFreshSink(key = 'x') {
    const path = `${os.tmpdir()}/${key}-rand-${Math.round(
        Math.random() * 100000
    )}`;
    try {
        fs.mkdirSync(path);
    } catch (e) {
        console.error(e);
        throw new Error('Failed creating test folder');
    }

    return new Sink({ path });
}

test('constructor() - no value for "options.path" argument - should throw', () => {
    expect(() => {
        // eslint-disable-next-line no-new
        new Sink();
    }).toThrowError('"options.path" is missing');
});

test('constructor() - has value for "options.path" argument - should be of Sink Class type', () => {
    expect(
        new Sink({
            path: './',
        })
    ).toBeInstanceOf(Sink);
});

test('.get() - non value should error', async () => {
    const sink = getFreshSink('get-1');
    expect(sink.get('some-key')).rejects.toMatchSnapshot();
});

test('.set() - should set value', async () => {
    const sink = getFreshSink('set-1');

    await sink.set('some-key-1', 'value-1');
    expect(await sink.get('some-key-1')).toBe('value-1');
});

test('.set() - should set a deep folder', async () => {
    const sink = getFreshSink('set-deep-1');
    await sink.set('folder/folder/some-key-1', 'value-1');
    expect(await sink.get('folder/folder/some-key-1')).toBe('value-1');
});

test('.set() - should not set value if missing value', async () => {
    expect.assertions(2);
    const sink = getFreshSink('set-2');

    try {
        await sink.set('some-key-1');
    } catch (e) {
        expect(e).toMatchSnapshot();
    }

    try {
        await sink.get('some-key-1');
    } catch (e) {
        expect(e).toMatchSnapshot();
    }
});

test('.has() - should return false if value not present', async () => {
    const sink = getFreshSink('has-1');

    expect(await sink.has('some-key-1')).toBe(false);
});

test('.has() - should return true if value present', async () => {
    const sink = getFreshSink('has-2');

    await sink.set('some-key-1', 'value-1');
    expect(await sink.has('some-key-1')).toBe(true);
});

test('.writer() - no value for "type" argument - should throw', () => {
    const sink = new Sink({
        path: './test/.tmp/',
    });
    expect(() => {
        sink.writer();
    }).toThrowError('"type" is missing');
});

test('dir() - should fetch file in root directory', async () => {
    const sink = new Sink({ path: './test/mock' });
    const directoryContent = await sink.dir('/');
    expect(directoryContent).toHaveLength(1);
    expect(directoryContent[0].fileName).toMatchSnapshot();
    expect(directoryContent[0].content.length).toMatchSnapshot();
});

test('dir() - should fetch all files in sub directory', async () => {
    const sink = new Sink({ path: './test/mock/' });
    const directoryContent = await sink.dir('/sub');
    expect(directoryContent).toMatchSnapshot();
});

test('dir() - should error when directory is missing', async () => {
    expect.assertions(1);
    const sink = new Sink({ path: './test/mock/' });
    try {
        await sink.dir('/missing');
    } catch (e) {
        expect(e.message).toMatchSnapshot();
    }
});

test('.writer() - save to non existing path - should emit "file not saved" event', done => {
    expect.assertions(0);
    const sink = new Sink({
        path: './test/.nonExistingDirectory/',
    });
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file not saved', () => {
        done();
    });
    source.pipe(dest);
});

test('.writer() - save to existing path - should emit "file saved" event', done => {
    expect.assertions(0);
    const sink = getFreshSink();
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', () => {
        done();
    });
    source.pipe(dest);
});

test('.writer() - on "file saved" - should have "id" and "file" on emitted event', done => {
    expect.assertions(2);
    const sink = getFreshSink();
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', (id, file) => {
        expect(id).toMatchSnapshot();
        expect(file).toMatchSnapshot();
        done();
    });
    source.pipe(dest);
});

test('.reader() - no value for "file" argument - should throw', () => {
    const sink = new Sink({
        path: './test/mock/',
    });
    expect(() => {
        sink.reader();
    }).toThrowError(
        'Expected "fileName" to be a string. Instead got undefined'
    );
});

test('.reader() - read non-existing file - should emit "file not found" event', done => {
    expect.assertions(0);
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.b.json');
    source.on('file not found', () => {
        done();
    });
});

test('.reader() - read non-existing file - should have filename as first argument in event', done => {
    expect.assertions(1);
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.b.json');
    source.on('file not found', file => {
        expect(file).toBe('feed.b.json');
        done();
    });
});

test('.reader() - read non-existing file - should emit (inherited) "error" event', done => {
    expect.assertions(0);
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.b.json');
    source.on('error', () => {
        done();
    });
});

test('.reader() - read existing file - should emit "file found" event', done => {
    expect.assertions(0);
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');
    source.on('file found', () => {
        done();
    });
});

test('.reader() - read existing file - should have filename as first argument in event', done => {
    expect.assertions(1);
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');
    source.on('file found', file => {
        expect(file).toBe('feed.a.json');
        done();
    });
});

test('.reader() - read existing file - should emit (inherited) "open" event', done => {
    expect.assertions(0);
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');
    source.on('open', () => {
        done();
    });
});

test('.reader() - read existing file - should emit (inherited) "open" event', done => {
    expect.assertions(0);
    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');
    source.on('open', () => {
        done();
    });
});

test('.reader() - read existing file - should stream read file', done => {
    expect.assertions(2);
    const dest = new stream.Writable({
        _data: false,
        write(chunk, encoding, next) {
            this._data += chunk;
            next();
        },
    });

    const sink = new Sink({
        path: './test/mock/',
    });
    const source = sink.reader('feed.a.json');

    source.on('file found', file => {
        source.pipe(dest);
        expect(file).toMatchSnapshot();
    });

    dest.on('finish', () => {
        expect(dest._data.length).toMatchSnapshot();
        done();
    });
});
