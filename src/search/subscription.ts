import i18n from '../i18n';

import * as VSCode from '../vscode';

import { ITreeProvider, Subscription } from '../treeProviders';

import { IFile } from '../modules';

export interface ISubscriptionSearchNode extends VSCode.QuickPickItem {
  label: string;
  metadata: IFile;
}

export class SubscriptionSearch {
  constructor(public readonly treeProvider: ITreeProvider<Subscription>) {
  }

  onDidChangeValue(value: string): Promise<ISubscriptionSearchNode[]> {
    const tasks = this.treeProvider.items.map(v => v.items);
    return Promise.all(tasks)
      .then(results => [].concat.apply([], results))
      .then(items => {
        return items.reduce((pv, cv) => {
          cv.files.forEach(file => {
            pv.push({
              label: file.filename,
              detail: `${cv.owner.login}> ${cv.label}`,
              metadata: file
            });
          });
          return pv;
        }, []);
      });
  }

  show() {
    const disposables: VSCode.Disposable[] = [];

    const p = new Promise<ISubscriptionSearchNode | undefined>(resolve => {
      const input = VSCode.window.createQuickPick<ISubscriptionSearchNode>();
      input.placeholder = i18n('explorer.search');
      disposables.push(
        input.onDidChangeValue(value => {
          input.busy = true;
          this.onDidChangeValue(value)
            .then(items => {
              input.items = items;
              input.busy = false;
            });
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
        VSCode.execute('GitHubGistExplorer.viewFile', selected);
      }
    })
    .finally(() => {
      disposables.forEach(d => d.dispose());
    });
  }
}
