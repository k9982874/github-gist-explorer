import { window, ProviderResult, TextDocumentContentProvider, Uri } from "vscode";

import * as api from "./api";

export default class ContentProvider implements TextDocumentContentProvider {
  provideTextDocumentContent(uri: Uri): string | ProviderResult<string> {
    return api.getFileWaitable(uri.path);
  }
}
