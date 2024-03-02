'use strict';
const fs = require('fs');
const path = require('path');
const pump = require('pump');
const compressing = require('compressing');

function clone(obj) {
  const newObj = {};
  for (const i in obj) {
    newObj[i] = obj[i];
  }
  return newObj;
}
function safePipe(streams) {
  return new Promise((resolve, reject) => {
    pump(streams[0], streams[1], err => {
      if (err) return reject(err);
      resolve();
    });
  });
}
function destType(dest) {
  if (typeof dest._write === 'function' || typeof dest._transform === 'function') return 'stream';
  if (typeof dest !== 'string') {
    const err = new Error('Type is not supported, must be a file path, or a writable stream');
    err.name = 'IlligalDestinationError';
    throw err;
  }
  return 'path';
}
const makeCompressDirFn = StreamClass => {
  return (dir, dest, opts) => {
    const destStream = destType(dest) === 'path' ? fs.createWriteStream(dest) : dest;
    const compressStream = new StreamClass();
    compressStream.addEntry(dir, opts);
    return safePipe([ compressStream, destStream ]);
  };
};
class NewZipStream extends compressing.zip.Stream {
  /**
   * 重载compressing模块中的方法，解决zip空文件夹无法打包问题
   * @param {String} entry 待处理的目录
   * @param {Object} opts 配置项
   */
  _addDirEntry(entry, opts) {
    // 先创建文件夹（注：相比父类的方法，重载方法只增加了下面一行代码）
    this._zipfile.addEmptyDirectory(opts.relativePath || path.basename(entry), opts);
    fs.readdir(entry, (err, files) => {
      if (err) return this.emit('error', err);
      const relativePath = opts.relativePath || '';
      files.forEach(fileOrDir => {
        const newOpts = clone(opts);
        if (opts.ignoreBase) {
          newOpts.relativePath = path.join(relativePath, fileOrDir);
        } else {
          newOpts.relativePath = path.join(relativePath, path.basename(entry), fileOrDir);
        }
        newOpts.ignoreBase = true;
        this.addEntry(path.join(entry, fileOrDir), newOpts);
      });
      this._onEntryFinish();
    });
  }
}

exports.compressDir = makeCompressDirFn(NewZipStream);
