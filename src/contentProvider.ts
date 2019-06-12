import { window, ProviderResult, TextDocumentContentProvider, Uri } from "vscode";

import * as api from "./api";

export default class ContentProvider implements TextDocumentContentProvider {
  provideTextDocumentContent(uri: Uri): string | ProviderResult<string> {
    switch(uri.scheme) {
      case "FileContent":
        return api.downloadFileWaitable(uri.query);
      case "ExportReport":
        return Buffer.from(uri.query, "base64").toString();
    }
  }
}
