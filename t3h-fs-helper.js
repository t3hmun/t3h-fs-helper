/*
 Lib for doing file system stuff on a slightly higher level than fs.
 */
'use strict';

const fs = require('fs');
const path = require('path');

module.exports.ensureDirCreated = ensureDirCreated;
module.exports.readFilesInDir = readFilesInDir;
module.exports.write = write;
module.exports.writeMany = writeMany;
module.exports.read = read;

/**
 * Checks if a dir and its parent dirs exists and creates them if they don't exist.
 * @param {string} dirPath - The path of the dir.
 * @returns {Promise} - And fs error (from fs.stat or fs.mkdir) or void on success.
 */
function ensureDirCreated(dirPath) {
    return new Promise((resolve, reject) => {
        fs.stat(dirPath, (err) => {
            if (err) {
                // ENOENT is the C error for error no entry, which means missing.
                if (err.code == 'ENOENT') {
                    let dirAbove = path.join(dirPath, '../');
                    // Recursively make sure the super-dir exists before creating this one.
                    ensureDirCreated(dirAbove).then(() => {
                        fs.mkdir(dirPath, 666, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                // Directory created, success.
                                resolve();
                                // There is no more code after this point.
                            }
                        });
                    }).catch((err) => {
                        // Error in the recursive call, propagate the error down to the original caller.
                        reject(err);
                    });
                } else {
                    // Any fs error that isn't ENOENT must be dealt with by the caller.
                    reject(err);
                }
            } else {
                // Directory already exists, success.
                resolve();
            }
        });
    });
}

/**
 * Reads all the files in specified dir that match the filter. Not recursive.
 * @param {string} dirPath - Read files in this dir.
 * @param {function(string):boolean=} filterFunc - Returns true on file-names that should be included. Default
 * always true.
 * @param {string=} encoding - Defaults to 'utf-8'.
 * @returns {Promise} - An array of objects with string properties {name, path, dir, data}.
 */
function readFilesInDir(dirPath, filterFunc, encoding) {
    filterFunc = filterFunc || (() => true);
    encoding = encoding || 'utf-8';
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, encoding, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            let reads = [];
            let failed = false;
            // In theory this sets the computer reading all the files in parallel.
            // Disks generally don't like being asked to do things in parallel (slow).
            // However I think I'll trust Node.js and the OS to deal with that detail, life is short.
            files.forEach((file) => {
                let filePath = path.join(dirPath, file);
                reads.push(new Promise((resolve, reject) => {
                    // Don't try to read anymore files if one has failed.
                    if (failed) return;
                    // Skip files that don't match the filter.
                    if (!filterFunc(file)) return;
                    fs.readFile(filePath, encoding, (err, data) => {
                        if (err) {
                            failed = true;
                            reject(err);
                            return;
                        }
                        resolve({
                            name: file,
                            path: filePath,
                            dir: dirPath,
                            data: data
                        });
                    });
                }));
            });
            Promise.all(reads).then((loadedFiles) => {
                resolve(loadedFiles);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}


/**
 * Writes data from each item.
 * @param {[]} items - Objects to write a file for each.
 * @param {function({}):[]} func - Function that returns the [dir, fileName, data] for each item.
 * @return {Promise} - void.
 */
function writeMany(items, func) {
    //console.log(items);
    let writes = [];
    items.forEach((item) => {
        let [dir, fileName, data] = func(item);
        writes.push(write(dir, fileName, data));
    });
    return Promise.all(writes);
}

/**
 * Writes a single file, promise wrapper for fs.writeFile.
 * @param {string} dir - Dir to write the file to.
 * @param {string} fileName - The filename to write.
 * @param {string} data - The data to write.
 * @return {Promise} - void.
 */
function write(dir, fileName, data) {
    let writePath = path.join(dir, fileName);
    return new Promise((resolve, reject) => {
        fs.writeFile(writePath, data, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

/**
 * Read a utf-8 file in a promise.
 * @param {string} filePath - The path of the file to read.
 * @return {Promise}<string>
 */
function read(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });

}
