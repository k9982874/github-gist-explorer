import i18n from "../i18n";

import { window, Disposable, QuickPickItem } from "vscode";

import * as VSCode from "../vscode";

import { ITreeProvider } from "../treeProviders";

import { IGist, IFile } from "../modules";

export interface IGistSearchNode extends QuickPickItem {
  label: string;
  metadata: IFile;
}

export class GistSearch {
  constructor(public readonly treeProvider: ITreeProvider<IGist>) {
  }

  onDidChangeValue(value: string): IGistSearchNode[] {
    return this.treeProvider.items.reduce((pv, cv) => {
      cv.files.forEach(v => {
        pv.push({
          label: v.filename,
          detail: cv.label,
          metadata: v
        });
      });
      return pv;
    }, []);
  }

  show() {
    const disposables: Disposable[] = [];

    const p = new Promise<IGistSearchNode | undefined>(resolve => {
      const input = window.createQuickPick<IGistSearchNode>();
      input.placeholder = i18n("explorer.search");
      disposables.push(
        input.onDidChangeValue(value => {
          input.items = this.onDidChangeValue(value);
          input.busy = false;
        }),
        input.onDidChangeSelection(items => {
          const item = items.shift();
          if (item) {
            resolve(item);
            input.hide();
          }
        }),
        input.onDidHide(() => {
          resolve(undefined);
          input.dispose();
        })
      );
      input.show();
    });

    p.then(selected => {
      if (selected) {
        VSCode.executeCommand("GitHubGistExplorer.editFile", selected);
      }
    })
    .finally(() => {
      disposables.forEach(d => d.dispose());
    });
  }
}
