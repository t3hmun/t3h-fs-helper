# t3h-fs-helper

This is my personal ES6 promise based fs helper library.

It is designed to build upon common fs functions using promises.

This library only contains the functions that I have needed so far, so there is a lot missing for general use.

Feel free to fork or add to this.

## Usage

`npm install t3h-fs-helper`

```js
const t3hfs = require("t3h-fs-helper");
t3hfs.write("./", "hello.txt", "hello");
```

## API

### Comments

The signature for `writeMany()` might seem a bit odd at first.
The idea behind it is that your code will probably already have an object storing filename, directory and data, this allows you to reuse that.

### The JsDoc

```js
/**
 * Checks if a dir and its parent dirs exists and creates them if they don't exist.
 * @param {string} dirPath - The path of the dir.
 * @returns {Promise} - And fs error (from fs.stat or fs.mkdir) or void on success.
 */
function ensureDirCreated(dirPath) {...}

/**
 * Reads all the files in specified dir that match the filter. Not recursive.
 * @param {string} dirPath - Read files in this dir.
 * @param {function(string):boolean=} filterFunc - Returns true on file-names that should be included. Default
 * always true.
 * @param {string=} encoding - Defaults to 'utf-8'.
 * @returns {Promise} - An array of objects with string properties {name, path, dir, data}.
 */
function readFilesInDir(dirPath, filterFunc, encoding) {...}

/**
 * Writes data from each item.
 * @param {[]} items - Objects to write a file for each.
 * @param {function({}):[]} func - Function that returns the [dir, fileName, data] for each item.
 * @return {Promise} - void.
 */
function writeMany(items, func) {...}

/**
 * Writes a single file, promise wrapper for fs.writeFile.
 * @param {string} dir - Dir to write the file to.
 * @param {string} fileName - The filename to write.
 * @param {string} data - The data to write.
 * @return {Promise} - void.
 */
function write(dir, fileName, data) {...}

/**
 * Read a utf-8 file in a promise.
 * @param {string} filePath - The path of the file to read.
 * @return {Promise}<string>
 */
function read(filePath) {...}

```

## License

ISC