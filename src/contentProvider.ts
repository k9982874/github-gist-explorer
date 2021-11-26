import { Event, EventEmitter, ProviderResult, TextDocumentContentProvider, Uri } from './vscode';

import * as filesystem from './filesystem';
import * as api from './api';

export default class ContentProvider implements TextDocumentContentProvider {
  private readonly onDidChangeEmitter: EventEmitter<Uri> = new EventEmitter<Uri>();
  readonly onDidChange: Event<Uri> = this.onDidChangeEmitter.event;

  static parseFile(filename: string, url: string, version?: string) {
    if (version) {
      const parsedPath = filesystem.parse(filename);
      return Uri.parse(`GistFile:${parsedPath.name}.${version}.${parsedPath.ext}?${url}`);
    } else {
      return Uri.parse(`GistFile:${filename}?${url}`);
    }
  }

  static parseReport(label: string, results: string[]) {
    const data = Buffer.from(results.join('\n')).toString('base64');
    return Uri.parse(`ExportReport:${label}.log?${data}`);
  }

  reload(uri: Uri) {
    this.onDidChangeEmitter.fire(uri);
  }

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    switch (uri.scheme) {
      case 'GistFile':
        if (uri.query) {
          return api.downloadFileWaitable(uri.query)
            .then(content => {
              console.log(content);
              return content;
            });
        }
        return '';
      case 'GistReport':
        return Buffer.from(uri.query, 'base64').toString();
    }
  }
}
