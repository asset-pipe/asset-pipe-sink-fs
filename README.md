# asset-pipe-sink-fs

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

Read an asset pipe feed from disc and serve it on http:

```js
const express = require('express');
const Sink = require('asset-pipe-sink-fs');

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


### writer(type)

Method for writing a file to disc. Returns a write stream.

Supported arguments are:

 - `type` - String - File type of the file to write. Used as extension of the persisted file. - Required

Events:

 - `file saved` - When a file have been sucessfully persisted.
 - `file not saved` -  When a file could not be persisted.
 - `error` -  When an error occured during persistence.


### reader(file)

Method for reading a file from disc. Returns a read stream.

Supported arguments are:

 - `file` - String - File name of the file to read.  - Required

Events:

 - `file found` - When the file we want to read is found.
 - `file not saved` -  When the file we want to read is not found.



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
