<!-- TITLE/ -->

<h1>@asset-pipe/sink-fs</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/asset-pipe/asset-pipe-sink-fs" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/asset-pipe/asset-pipe-sink-fs/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/@asset-pipe/sink-fs" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@asset-pipe/sink-fs.svg" alt="NPM version" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/asset-pipe/asset-pipe-sink-fs" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/asset-pipe/asset-pipe-sink-fs.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/asset-pipe/asset-pipe-sink-fs#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/asset-pipe/asset-pipe-sink-fs.svg" alt="Dev Dependency Status" /></a></span>

<!-- /BADGES -->


[![Greenkeeper badge](https://badges.greenkeeper.io/asset-pipe/asset-pipe-sink-fs.svg)](https://greenkeeper.io/)

A [asset-pipe][asset-pipe] sink for writing to and reading from local file system.

The intention of the [asset-pipe][asset-pipe] sink modules is to use be able to write and read files
to different backends by just swapping modules. By each sink implementing the same public API it is
possible to ex use this module in one environment and another sink module in another environment.

These sinks are normally used by the [asset-pipe-build-server][asset-pipe-build-server].



## Installation

```bash
$ npm install asset-pipe-sink-fs
```



## Example

Read an asset feed from disc and serve it on http:

```js
const express = require('express');
const Sink = require('@asset-pipe/sink-fs');

const app = express();
const sink = new Sink({
    path: './feeds/',
});

app.get('/', (req, res, next) => {
    const file = sink.reader('feed.json');
    file.on('file not found', () => {
        res.status(404).send('File not found');
    });
    file.on('file found', () => {
        res.status(200);
        file.pipe(res);
    });
});

app.listen(8000);
```



## API

This module have the following API:

### constructor(options)

Supported arguments are:

 - `options.path` - String - path to where files whould be / are persisted.


### get(fileName: string): Promise<string>

Async method for reading a file from storage

### set(fileName: string, fileContent: string): Promise<void>

Async method for writing file to storage

### has(fileName: string): Promise<Boolean>

Async method for checking if file exist in storage


### writer(type)

Method for writing a file to disc. Returns a write stream.

Supported arguments are:

 - `type` - String - File type of the file to write. Used as extension of the persisted file. - Required

Events:

 - `file saved` - When a file have been sucessfully persisted. Emits with: `id` and `file`.
 - `file not saved` -  When a file could not be persisted. Emits with: `error`.
 - `error` -  When an error occured during persistence. Emits with: `error`.


### reader(file)

Method for reading a file from disc. Returns a read stream.

Supported arguments are:

 - `file` - String - File name of the file to read.  - Required

Events:

 - `file found` - When the file we want to read is found. Emits with: `file`.
 - `file not saved` -  When the file we want to read is not found. Emits with: `file`.



## License

The MIT License (MIT)

Copyright (c) 2017 - Trygve Lie - post@trygve-lie.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.



[asset-pipe]: https://github.com/asset-pipe
[asset-pipe-build-server]: https://github.com/asset-pipe/asset-pipe-build-server

## Contributing

The contribution process is as follows:

- Fork this repository.
- Make your changes as desired.
- Run the tests using `npm test`. This will also check to ensure that 100% code coverage is maintained. If not you may need to add additional tests.
- Stage your changes.
- Run `git commit` or, if you are not familiar with [semantic commit messages](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit), please run `npm run cm` and follow the prompts instead which will help you write a correct semantic commit message.
- Push your changes and submit a PR.
