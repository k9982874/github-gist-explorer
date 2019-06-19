import i18n from "./i18n";

import { extensions, Disposable, Event, EventEmitter, FileChangeEvent, FileChangeType, FileStat, FileSystemError, FileSystemProvider, FileType, Uri } from "vscode";

import * as chokidar from "chokidar";

import * as filesystem from "./filesystem";

import * as constans from "./constans";

import promisify from "./promisify";
import debounce from "./debounce";

import Configuration from "./configuration";

export interface IGistFileSystemProvider extends FileSystemProvider {
  exists(uri: Uri): boolean | Thenable<boolean>;
  writeFile(uri: Uri, content: string | Object): void | Thenable<void>;
}

export default class GistFileSystemProvider implements IGistFileSystemProvider {
  private readonly onDidChangeFileEmitter: EventEmitter<FileChangeEvent[]> = new EventEmitter<FileChangeEvent[]>();
  readonly onDidChangeFile: Event<FileChangeEvent[]> = this.onDidChangeFileEmitter.event;

  static homeDirectory(): string {
    return extensions.getExtension(constans.EXTENSION_ID).extensionPath;
  }

  static fullPath(uri: Uri): string {
    const home = GistFileSystemProvider.homeDirectory();
    return `${home}/${uri.authority}${uri.fsPath}`;
  }

  static parseGist(gist: { id: string }): Uri {
      return Uri.parse(`gistfs://${Configuration.github.username}/${gist.id}`);
  }

  static parseFile(file: { gistID: string, filename: string, rawURL: string }): Uri {
    return Uri.parse(`gistfs://${Configuration.github.username}/${file.gistID}/${file.filename}?${file.rawURL}`);
  }

  promise = new class {
    constructor(private readonly provider: IGistFileSystemProvider) {}

    exists: (uri: Uri) => Promise<boolean> = promisify(this.provider.exists, this.provider);
    stat: (uri: Uri) => Promise<FileStat> = promisify(this.provider.stat, this.provider);
    readDirectory: (uri: Uri) => Promise<[string, FileType][]> = promisify(this.provider.readDirectory, this.provider);
    createDirectory: (uri: Uri) => Promise<void> = promisify(this.provider.createDirectory, this.provider);
    readFile: (uri: Uri) => Promise<Uint8Array> = promisify(this.provider.readFile, this.provider);
    writeFile: (uri: Uri, content: string | Object) => Promise<void> = promisify(this.provider.writeFile, this.provider);
    delete: (uri: Uri, options: { recursive: boolean }) => Promise<void> = promisify(this.provider.delete, this.provider);
    rename: (oldUri: Uri, newUri: Uri, options: { overwrite: boolean }) => Promise<void> = promisify(this.provider.rename, this.provider);
    copy: (source: Uri, destination: Uri, options: { overwrite: boolean }) => Promise<void> = promisify(this.provider.copy, this.provider);
  }(this);

  watch(uri: Uri, options: { recursive: boolean; excludes: string[] }): Disposable {
    const fullpath = GistFileSystemProvider.fullPath(uri);

    const watcher = chokidar.watch(fullpath, {ignored: /^\./, persistent: true});

    const func = debounce(() => {
      this.onDidChangeFileEmitter.fire([{ type: FileChangeType.Changed, uri }]);
    }, 1500, true);
    watcher.on("change", func);

    return { dispose: () => watcher.close() };
  }

  exists(uri: Uri): boolean | Thenable<boolean> {
    const fullpath = GistFileSystemProvider.fullPath(uri);
    return filesystem.exists(fullpath);
  }

  stat(uri: Uri): FileStat | Thenable<FileStat> {
    const fullpath = GistFileSystemProvider.fullPath(uri);
    return this._stat(fullpath);
  }

  private async _stat(path: string): Promise<FileStat> {
    const res = await filesystem.statLink(path);
    return new GistFileStat(res.stat, res.isSymbolicLink);
  }

  readDirectory(uri: Uri): [string, FileType][] | Thenable<[string, FileType][]> {
    return this._readDirectory(uri);
  }

  private async _readDirectory(uri: Uri): Promise<[string, FileType][]> {
    const fullpath = GistFileSystemProvider.fullPath(uri);

    const children = await filesystem.readdir(fullpath);

    const result: [string, FileType][] = [];
    for (const child of children) {
      const stat = await this._stat(filesystem.join(fullpath, child));
      result.push([child, stat.type]);
    }

    return Promise.resolve(result);
  }

  createDirectory(uri: Uri): void | Thenable<void> {
    const fullpath = GistFileSystemProvider.fullPath(uri);
    return filesystem.mkdir(fullpath);
  }

  readFile(uri: Uri): Uint8Array | Thenable<Uint8Array> {
    const fullpath = GistFileSystemProvider.fullPath(uri);
    return filesystem.readfile(fullpath);
  }

  writeFile(uri: Uri, content: string | Object): void | Thenable<void>;
  writeFile(uri: Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean }): void | Thenable<void>;
  writeFile(uri: Uri, content: string | Object| Uint8Array, options?: { create: boolean; overwrite: boolean }): void | Thenable<void> {
    let buf: Uint8Array;

    if (content instanceof Uint8Array) {
      buf = content;
    } else {
      let data: string;
      if (typeof content === "string") {
        data = content;
      } else if (typeof content === "object") {
        data = ("toString" in content) ? content.toString() : JSON.stringify(content);
      } else {
        const msg = i18n("error.unknown_file_format");
        return Promise.reject(new Error(msg));
      }

      buf = Uint8Array.from(Buffer.from(data));
    }

    return this._writeFile(uri, buf, options === undefined ? { create: true, overwrite: true} : options);
  }

  private async _writeFile(uri: Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean }): Promise<void> {
    const fullpath = GistFileSystemProvider.fullPath(uri);

    const exists = await filesystem.exists(fullpath);
    if (!exists) {
      if (!options.create) {
        throw FileSystemError.FileNotFound();
      }

      await filesystem.mkdir(filesystem.dirname(fullpath));
    } else {
      if (!options.overwrite) {
        throw FileSystemError.FileExists();
      }
    }

    return filesystem.writefile(fullpath, content as Buffer);
  }

  delete(uri: Uri, options: { recursive: boolean }): void | Thenable<void> {
    const fullpath = GistFileSystemProvider.fullPath(uri);
    if (options.recursive) {
      return filesystem.rmrf(fullpath);
    }

    return filesystem.unlink(fullpath);
  }

  rename(oldUri: Uri, newUri: Uri, options: { overwrite: boolean }): void | Thenable<void> {
    return this._rename(oldUri, newUri, options);
  }

  private async _rename(oldUri: Uri, newUri: Uri, options: { overwrite: boolean }): Promise<void> {
    const oldPath = GistFileSystemProvider.fullPath(oldUri);
    const newPath = GistFileSystemProvider.fullPath(newUri);

    const exists = await filesystem.exists(newPath);
    if (exists) {
      if (!options.overwrite) {
        throw FileSystemError.FileExists();
      } else {
        await filesystem.rmrf(newPath);
      }
    }

    const parentExists = await filesystem.exists(filesystem.dirname(newPath));
    if (!parentExists) {
      await filesystem.mkdir(filesystem.dirname(newPath));
    }

    return filesystem.rename(oldPath, newPath);
  }

  copy?(source: Uri, destination: Uri, options: { overwrite: boolean }): void | Thenable<void> {
    const srcPath = GistFileSystemProvider.fullPath(source);
    const destPath = GistFileSystemProvider.fullPath(destination);
    return filesystem.copyFile(srcPath, destPath);
  }
}

export class GistFileStat implements FileStat {
  constructor(private fsStat: filesystem.Stats, private _isSymbolicLink: boolean) {}

  get type(): FileType {
    let type: number = FileType.Unknown;

    if (this.fsStat.isFile()) {
      type = FileType.File;
    } else if (this.fsStat.isDirectory()) {
      type = FileType.Directory;
    }

    if (this._isSymbolicLink) {
      type = FileType.SymbolicLink | type;
    }

    return type;
  }

  get isFile(): boolean | undefined {
    return this.fsStat.isFile();
  }

  get isDirectory(): boolean | undefined {
    return this.fsStat.isDirectory();
  }

  get isSymbolicLink(): boolean | undefined {
    return this._isSymbolicLink;
  }

  get size(): number {
    return this.fsStat.size;
  }

  get ctime(): number {
    return this.fsStat.ctime.getTime();
  }

  get mtime(): number {
    return this.fsStat.mtime.getTime();
  }
}
