import i18n from './i18n';

import { CancellationToken, FileSystemError } from './vscode';

import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

export { basename, dirname, extname, join, parse, resolve } from 'path';
export { existsSync, readFileSync, watch } from 'fs';

export declare type Stats = fs.Stats;

export interface IStatAndLink {
  stat: fs.Stats;
  isSymbolicLink: boolean;
}

function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
  if (error) {
    reject(massageError(error));
  } else {
    resolve(result);
  }
}

function massageError(error: Error & { code?: string }): Error {
  if (error.code === 'ENOENT') {
    return FileSystemError.FileNotFound();
  }

  if (error.code === 'EISDIR') {
    return FileSystemError.FileIsADirectory();
  }

  if (error.code === 'EEXIST') {
    return FileSystemError.FileExists();
  }

  if (error.code === 'EPERM' || error.code === 'EACCESS') {
    return FileSystemError.NoPermissions();
  }

  return error;
}

export function checkCancellation(token: CancellationToken): void {
  if (token.isCancellationRequested) {
    const msg = i18n('error.operation_cancelled');
    throw new Error(msg);
  }
}

export function normalizeNFC(items: string): string;
export function normalizeNFC(items: string[]): string[];
export function normalizeNFC(items: string | string[]): string | string[] {
  if (process.platform !== 'darwin') {
    return items;
  }

  if (Array.isArray(items)) {
    return items.map(item => item.normalize('NFC'));
  }

  return items.normalize('NFC');
}

export function readdir(dir: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(dir, (error, children) => handleResult(resolve, reject, error, normalizeNFC(children)));
  });
}

export function walkdir(dir: string, exculds?: string[]): Promise<string[]> {
  return stat(dir)
    .then(s => {
      if (s.isDirectory()) {
        return readdir(dir)
          .then(result => {
            return Promise.all(result.filter(v => !(exculds || []).includes(v)).map(v => walkdir(path.join(dir, v), exculds)))
              .then(result => [].concat.apply([], result));
          });
      } else {
        return [ dir ];
      }
    });
}

export function stat(path: string): Promise<fs.Stats> {
  return new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
  });
}

export function readfile(path: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
  });
}

export function writefile(path: string | number, content: String | Buffer): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, content, error => handleResult(resolve, reject, error, void 0));
  });
}

export function exists(path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    fs.exists(path, exists => handleResult(resolve, reject, undefined, exists));
  });
}

export function rmrf(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, error => handleResult(resolve, reject, error, void 0));
  });
}

export function mkdir(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    mkdirp(path, error => handleResult(resolve, reject, error, void 0));
  });
}

export function rename(oldPath: string, newPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.rename(oldPath, newPath, error => handleResult(resolve, reject, error, void 0));
  });
}

export function unlink(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(path, error => handleResult(resolve, reject, error, void 0));
  });
}

export function statLink(path: string): Promise<IStatAndLink> {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (error, lstat) => {
      if (error || lstat.isSymbolicLink()) {
        fs.stat(path, (error, stat) => {
          if (error) {
            return handleResult(resolve, reject, error, void 0);
          }

          handleResult(resolve, reject, error, {
            stat,
            isSymbolicLink: lstat && lstat.isSymbolicLink()
          });
        });
      } else {
        handleResult(resolve, reject, error, {
          stat: lstat,
          isSymbolicLink: false
        });
      }
    });
  });
}

export function copyFile(src: string, dest: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.copyFile(src, dest, error => handleResult(resolve, reject, error, void 0));
  });
}
