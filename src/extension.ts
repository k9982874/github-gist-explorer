'use strict';

import i18n from './i18n';

import * as VSCode from './vscode';
import { Command, Event, Extension, FileSystemProvider, Subscriber, TextDocumentContentProvider, TreeDataProvider, WebviewPanel } from 'vscode-extension-decorator';

import * as clipboardy from 'clipboardy';

import * as filesystem from './filesystem';

import * as constans from './constans';
import * as api from './api';

import { loading } from './waitify';

import { IGist, IFile } from './modules';

import Configuration from './configuration';

import GistFileSystemProvider from './filesystemProvider';

import ShortCut from './shortcut';

import HistoryViewProvider from './historyProvider';
import ContentProvider from './contentProvider';

import { UserTreeItem, GistTreeItem, FileTreeItem, GistTreeProvider, SubscriptionTreeProvider, Subscription } from './treeProviders';

import { GistSearch, SubscriptionSearch } from './search';

@Extension
export class GitHubGistExplorer extends Subscriber {
  @FileSystemProvider('gistfs', { isCaseSensitive: process.platform === 'linux' })
  public readonly gistFileSystem: GistFileSystemProvider = new GistFileSystemProvider();

  @WebviewPanel('GistHistory')
  public readonly historyView: HistoryViewProvider = new HistoryViewProvider();

  @TextDocumentContentProvider('GistFile')
  public readonly fileContentProvider: ContentProvider = new ContentProvider();

  @TextDocumentContentProvider('GistReport')
  public readonly reportContentProvider: ContentProvider = new ContentProvider();

  @TreeDataProvider('GistTree')
  @Command('GitHubGistExplorer.GistTree.sortByLabel', 'sortByLabel')
  @Command('GitHubGistExplorer.GistTree.sortByLastUpdated', 'sortByLastUpdated')
  @Command('GitHubGistExplorer.GistTree.sortByCreated', 'sortByCreated')
  @Command('GitHubGistExplorer.GistTree.ascending', 'ascending')
  @Command('GitHubGistExplorer.GistTree.descending', 'descending')
  public readonly gistTree: GistTreeProvider = new GistTreeProvider();

  @TreeDataProvider('SubscriptionTree')
  @Command('GitHubGistExplorer.subscribeGist', 'subscribe')
  @Command('GitHubGistExplorer.unsubscribeGist', 'unsubscribe')
  @Command('GitHubGistExplorer.SubscriptionTree.sortByLabel', 'sortByLabel')
  @Command('GitHubGistExplorer.SubscriptionTree.sortByLastUpdated', 'sortByLastUpdated')
  @Command('GitHubGistExplorer.SubscriptionTree.sortByCreated', 'sortByCreated')
  @Command('GitHubGistExplorer.SubscriptionTree.ascending', 'ascending')
  @Command('GitHubGistExplorer.SubscriptionTree.descending', 'descending')
  public readonly subscriptionTree: SubscriptionTreeProvider = new SubscriptionTreeProvider();

  @Command('GitHubGistExplorer.shortcut.saveFile', 'saveFile')
  @Command('GitHubGistExplorer.shortcut.clipSelection', 'clipSelection')
  @Command('GitHubGistExplorer.shortcut.pasteClipboard', 'pasteClipboard')
  @Command('GitHubGistExplorer.shortcut.importFolder', 'importFolder')
  public readonly shortcut: ShortCut = new ShortCut(this.gistTree);

  @Command('GitHubGistExplorer.shortcut.gistSearch', 'show')
  @Command('GitHubGistExplorer.GistTree.search', 'show')
  public readonly gistSearch: GistSearch = new GistSearch(this.gistTree);

  @Command('GitHubGistExplorer.shortcut.subscriptionSearch', 'show')
  @Command('GitHubGistExplorer.SubscriptionTree.search', 'show')
  public readonly subscriptionSearch: SubscriptionSearch = new SubscriptionSearch(this.subscriptionTree);

  constructor(context: VSCode.ExtensionContext) {
    super(context);

    this.register(this.gistFileSystem.onDidChangeFile, this.gistFileSystem, this.didChangeFileHandle);
  }

  @Command('GitHubGistExplorer.GistTree.refresh')
  @Command('GitHubGistExplorer.SubscriptionTree.refresh')
  refresh(commandId: string) {
    if (commandId === 'GitHubGistExplorer.SubscriptionTree.refresh') {
      this.subscriptionTree.refresh();
    } else {
      const home: string = GistFileSystemProvider.homeDirectory();
      filesystem.rmrf(home).finally(() => {
        this.gistTree.refresh();
      });
    }
  }

  @Command('GitHubGistExplorer.viewUser')
  viewUser(commandId: string, node: UserTreeItem) {
    VSCode.execute('vscode.open', VSCode.Uri.parse(node.metadata.htmlURL));
  }

  @Command('GitHubGistExplorer.addGist')
  @Command('GitHubGistExplorer.shortcut.newGist')
  addGist() {
    const options = {
      prompt: i18n('explorer.add_gist_description')
    };
    VSCode.showInputBox(options)
      .then(description => {
        const pub: string = i18n('explorer.public');
        const sec: string = i18n('explorer.secret');

        return VSCode.showQuickPick(
            [ pub, sec ],
            { placeHolder: i18n('explorer.add_gist_type')}
          )
          .then(selected => {
            if (selected) {
              const type = selected === pub ? constans.GistType.Public : constans.GistType.Secret;
              return { type, description };
            } else {
              return undefined;
            }
        });
      })
      .then((content) => {
        if (content === undefined) {
          VSCode.message('error.gist_type_required').warn();
          return undefined;
        }
        return api.addWaitable(content.type, content.description);
      })
      .then(gist => {
        if (gist) {
          this.gistTree.refresh();
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.editGist')
  editGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;

    const options = {
      value: gist.label,
      prompt: i18n('explorer.edit_gist_description')
    };
    VSCode.showInputBox(options)
      .then(value => {
        if (value !== undefined) {
          return api.updateWaitable(gist.id, value)
            .then(() => {
              this.gistTree.refresh();
            });
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.deleteGist')
  deleteGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;

    VSCode.message('explorer.deleting_gist_confirmation', gist.label).warn({ modal: true }, i18n('explorer.ok'))
      .then(reply => {
        if (reply) {
          return api.destroyWaitable(gist.id)
            .then(() => {
              const uri = GistFileSystemProvider.parseGist(gist);
              return this.gistFileSystem.promise.delete(uri, { recursive: true });
            }).then(() => {
              this.gistTree.refresh();
            });
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.starGist')
  starGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;
    api.starWaitable(gist.id)
      .then(() => {
        this.gistTree.refresh();
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.unstarGist')
  unstarGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;
    api.unstarWaitable(gist.id)
      .then(() => {
        this.gistTree.refresh();
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.sync')
  @Command('GitHubGistExplorer.shortcut.sync')
  sync(commandId: string, node: GistTreeItem | FileTreeItem | VSCode.Uri | undefined) {
    const now = new Date().toLocaleString();

    if (node === undefined) {
      const tasks = this.gistTree.items.map(v => this.syncGist(v));
      return loading('explorer.synchronizing', () => Promise.all(tasks))
        .then(() => {
          const msg = `${now}: ${i18n('explorer.sync_succeed', 'ALL')}`;
          VSCode.info(msg);
        })
        .catch(error => {
          console.log(error);
          const msg = `${now}: ${i18n('explorer.sync_succeed', 'ALL')}`;
          VSCode.error(msg);
        });
    }

    if (node instanceof GistTreeItem) {
      const gist: IGist = node.metadata;
      return loading('explorer.synchronizing', () => this.syncGist(gist))
        .then(() => {
          const msg = `${now}: ${i18n('explorer.sync_succeed', gist.label)}`;
          VSCode.info(msg);
        }).catch(error => {
          console.log(error);
          const msg = `${now}: ${i18n('explorer.sync_succeed', gist.label)}`;
          VSCode.error(msg);
        });
    }

    if (node instanceof FileTreeItem) {
      const file: IFile = node.metadata;
      return loading('explorer.synchronizing', () => this.syncFile(file))
        .then(() => {
          const msg = `${now}: ${i18n('explorer.sync_succeed', file.filename)}`;
          VSCode.info(msg);
        }).catch(error => {
          console.log(error);
          const msg = `${now}: ${i18n('explorer.sync_failed', file.filename)}`;
          VSCode.error(msg);
        });
    }

    if (node instanceof VSCode.Uri) {
      if (node.scheme === 'gistfs') {
        const [ gistID, filename ] = node.path.substring(1).split('/');
        if (gistID && filename) {
          const file: IFile = {
            gistID,
            filename,
            type: '',
            language: '',
            rawURL: node.query,
            size: 0
          };
          return loading('explorer.synchronizing', () => this.syncFile(file))
            .then(() => {
              const msg = `${now}: ${i18n('explorer.sync_succeed', file.filename)}`;
              VSCode.info(msg);
            }).catch(error => {
              console.log(error);
              const msg = `${now}: ${i18n('explorer.sync_failed', file.filename)}`;
              VSCode.error(msg);
            });
        }
      }
    }
  }

  syncGist(gist: IGist) {
    const files = gist.files.reduce((pv, cv) => {
      const fileUri = GistFileSystemProvider.parseFile(cv);

      const path = GistFileSystemProvider.fullPath(fileUri);

      const exists = filesystem.existsSync(path);
      if (exists) {
        const content = filesystem.readFileSync(path);
        pv.push({
          filename: cv.filename,
          content
        })
      }
      return pv;
    }, []);

    return api.update(gist.id, gist.label, files);
  }

  syncFile(file: IFile) {
    const fileUri = GistFileSystemProvider.parseFile(file);

    const path = GistFileSystemProvider.fullPath(fileUri);
    return filesystem.readfile(path).then(content => {
      api.updateFile(file.gistID, file.filename, content);
    });
  }

  @Command('GitHubGistExplorer.history')
  history(commandId: string, node: GistTreeItem) {
    HistoryViewProvider.show(node.metadata);
  }

  @Command('GitHubGistExplorer.exportAll')
  exportAll(commandId: string, node: UserTreeItem) {
    const options = {
      openLabel: i18n('explorer.export'),
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false
    };
    VSCode.showOpenDialog(options)
      .then(uris => {
        if (!uris || uris.length === 0) {
          return [];
        }
        const path = uris.shift().path;
        return path;
      })
      .then(path => {
        const subscription = new Subscription(node.metadata);
        return loading('explorer.retrieve_user', () => {
          return subscription.items.then(gists => {
            return gists.reduce((pv, cv) => {
              cv.files.map(file => {
                const content = {
                  url: file.rawURL,
                  baseDir: `${path}/${cv.label}`,
                  filename: file.filename,
                  fullPath: `${path}/${cv.label}/${file.filename}`
                };
                pv.push(content);
              });
              return pv;
            }, []);
          });
        });
      })
      .then(files => {
        const tasks = files.map(v => {
          return api.downloadFile(v.url)
            .then(content => {
              if (filesystem.existsSync(v.baseDir)) {
                return Promise.resolve(content);
              }
              return filesystem.mkdir(v.baseDir).then(() => content);
            })
            .then(content => {
              return filesystem.writefile(v.fullPath, content);
            })
            .then(() => {
              return new Date().toLocaleString() + ': ' + i18n('explorer.export_succeed', v.filename);
            })
            .catch(error => {
              return new Date().toLocaleString() + ': ' + i18n('explorer.export_failed', v.filename);
            });
        });

        if (tasks.length === 0) {
          VSCode.message('explorer.export_cancelled').warn();
          return undefined;
        }
        return loading('explorer.exporting_files', () => Promise.all(tasks))
          .then(results => {
            return VSCode.message('explorer.export_completed').info(i18n('explorer.view_report'))
              .then(reply => reply ? results : undefined);
          });
      })
      .then(results => {
        if (results) {
          const uri = ContentProvider.parseReport(node.metadata.profile.name, results);
          VSCode.showTextDocument(uri);
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.exportGist')
  exportGist(commandId: string, node: GistTreeItem) {
    const gist = node.metadata;

    const options = {
      openLabel: i18n('explorer.export'),
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false
    };
    VSCode.showOpenDialog(options)
      .then(uris => {
        if (!uris || uris.length === 0) {
          return [];
        }

        const path = uris.shift().path;

        const tasks = gist.files.map(file => {
          return api.downloadFile(file.rawURL)
            .then(content => {
              return filesystem.writefile(`${path}/${file.filename}`, content);
            })
            .then(() => {
              return new Date().toLocaleString() + ': ' + i18n('explorer.export_succeed', file.filename);
            })
            .catch(error => {
              return new Date().toLocaleString() + ': ' + i18n('explorer.export_failed', file.filename);
            });
        });

        if (tasks.length === 0) {
          VSCode.message('explorer.export_cancelled').warn();
          return undefined;
        }
        return loading('explorer.exporting_files', () => Promise.all(tasks))
          .then(results => {
            return VSCode.message('explorer.export_completed').info(i18n('explorer.view_report'))
              .then(reply => reply ? results : undefined);
          });
      })
      .then(results => {
        if (results) {
          const uri = ContentProvider.parseReport(gist.label, results);
          VSCode.showTextDocument(uri);
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.paste')
  paste(commandId: string, node: GistTreeItem) {
    clipboardy.read()
      .then(content => {
        if (content.trim().length === 0) {
          VSCode.message('error.empty_clipboard').info();
        } else {
          this.createFile(node, content);
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.addFile')
  addFile(commandId: string, node: GistTreeItem) {
    const importFile = i18n('explorer.import_file');
    const newFile = i18n('explorer.new_file');

    VSCode.showQuickPick([ importFile, newFile ])
      .then(selected => {
        switch (selected) {
          case importFile:
            return this.importFile(node);
          case newFile:
            return this.createFile(node);
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  createFile(node: GistTreeItem, content?: string) {
    const options = {
      prompt: i18n('explorer.add_file_name')
    };
    return VSCode.showInputBox(options)
      .then(filename => {
        if (!filename) {
          VSCode.message('error.file_name_required').warn();
          return;
        }

        return api.updateFileWaitable(node.metadata.id, filename, content || i18n('explorer.empty_file'))
          .then(() => {
            this.gistTree.refresh();
          });
      });
  }

  importFile(node: GistTreeItem) {
    const options = {
      openLabel: i18n('explorer.import'),
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: true
    };
    return VSCode.showOpenDialog(options)
      .then(uris => {
        if (!uris || uris.length === 0) {
          return [];
        }
        const tasks = uris.map(v => {
          const filename = filesystem.basename(v.path);
          return filesystem.readfile(v.path)
            .then(content => ({ filename, content }));
        });

        if (tasks.length === 0) {
          VSCode.message('explorer.import_cancelled').warn();
          return undefined;
        }

        return tasks;
      })
      .then(tasks => {
        return loading<IGist>('explorer.importing_files', () => {
            return Promise.all(tasks)
              .then(files => {
                return api.update(node.metadata.id, undefined, files);
              });
          });
      })
      .then(gist => {
        if (gist) {
          this.gistTree.refresh();
        }
      });
  }

  @Command('GitHubGistExplorer.editFile')
  editFile(commandId: string, node: FileTreeItem) {
    const file: IFile = node.metadata;
    const fileUri = GistFileSystemProvider.parseFile(file);

    const gistUri = GistFileSystemProvider.parseGist({ id: file.gistID });

    this.gistFileSystem.promise.exists(gistUri)
      .then(exists => exists ? Promise.resolve() : this.gistFileSystem.promise.createDirectory(gistUri))
      .then(() => this.gistFileSystem.promise.exists(fileUri))
      .then(exists => {
        if (exists) {
          return Promise.resolve();
        }

        return api.downloadFileWaitable(fileUri.query)
          .then(content => this.gistFileSystem.promise.writeFile(fileUri, content));
      })
      .then(() => {
        const uri = GistFileSystemProvider.parseFile(file);
        return VSCode.openTextDocument(uri);
      })
      .then(doc => {
        VSCode.showTextDocument(doc, { preview: true });
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.viewFile')
  viewFile(command: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    const uri = ContentProvider.parseFile(file.filename, file.rawURL);
    VSCode.showTextDocument(uri, { preview: true });
  }

  @Command('GitHubGistExplorer.deleteFile')
  deleteFile(commandId: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    VSCode.message('explorer.deleting_file_confirmation', file.filename).warn({ modal: true }, i18n('explorer.ok'))
      .then(reply => {
        if (reply) {
          return api.deleteFileWaitable(file.gistID, file.filename)
            .then(() => {
              const uri = GistFileSystemProvider.parseFile(file);
              return this.gistFileSystem.promise.delete(uri, { recursive: false });
            })
            .then(() => {
              this.gistTree.refresh();
            });
        }
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.renameFile')
  renameFile(commandId: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    const options = {
      value: file.filename,
      prompt: i18n('explorer.rename_file_name')
    };
    VSCode.showInputBox(options)
      .then(value => {
        if (value === undefined) {
          return;
        }

        if (value.length === 0) {
          VSCode.message('error.file_name_required').warn();
          return;
        }

        return api.renameFileWaitable(file.gistID, file.filename, value)
          .then(() => {
            const uri = GistFileSystemProvider.parseFile(file);
            return this.gistFileSystem.promise.delete(uri, { recursive: false });
          })
          .then(() => {
            this.gistTree.refresh();
          });
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.reloadFile')
  reloadFile(commandId: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    const uri = GistFileSystemProvider.parseFile(file);

    this.gistFileSystem.promise.delete(uri, { recursive: false })
      .then(() => {
        this.gistFileSystem.readFile(uri);
      })
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Command('GitHubGistExplorer.openInBrowser')
  openInBrowser(commandId: string, node: GistTreeItem | FileTreeItem) {
    const url = (node instanceof GistTreeItem) ? node.metadata.htmlURL :node.metadata.rawURL
    VSCode.execute('vscode.open', VSCode.Uri.parse(url));

  }

  @Command('GitHubGistExplorer.copyToClipboard')
  copyToClipboard(commandId: string, node: GistTreeItem | FileTreeItem) {
    const url = (node instanceof GistTreeItem) ? node.metadata.htmlURL :node.metadata.rawURL
    clipboardy.write(url)
      .catch(error => {
        VSCode.error(error.message);
      });
  }

  @Event('onDidChangeConfiguration')
  didChangeConfigurationHandle(eventId: string, event: VSCode.ConfigurationChangeEvent) {
    const changes = Configuration.affects(event);
    if (changes.length > 0) {
      if (changes.includes('GithubGistExplorer.explorer.subscriptions')) {
        this.subscriptionTree.refresh();
      } else {
        const home: string = GistFileSystemProvider.homeDirectory();
        filesystem.rmrf(home).finally(() => {
          this.gistTree.refresh();
        });
      }
    }
  }

  didChangeFileHandle(events: VSCode.FileChangeEvent[]) {
    if (Configuration.explorer.uploadOnSave) {
      events.forEach(e => {
        if (e.type === VSCode.FileChangeType.Changed) {
          if (e.uri.scheme === 'gistfs') {
            const [ gistID, filename ] = e.uri.path.substring(1).split('/');
            if (gistID && filename) {
              const path = GistFileSystemProvider.fullPath(e.uri);
              filesystem.readfile(path)
                .then(content => {
                  api.updateFileWaitable(gistID, filename, content);
                });
            }
          }
        }
      });
    }
  }
}

export function activate(context: VSCode.ExtensionContext) {
  const explorer = new GitHubGistExplorer(context);

  const gistAscending: boolean = Configuration.explorer.gistAscending;
  const subscriptionAscending: boolean = Configuration.explorer.subscriptionAscending;
  Promise.all([
    VSCode.execute('setContext', 'GistAscending', gistAscending),
    VSCode.execute('setContext', 'SubscriptionAscending', subscriptionAscending)
  ])
  .then(() => {
    const gistSortBy: string = Configuration.explorer.gistSortBy;
    explorer.gistTree.sort(gistSortBy, gistAscending);

    const subscriptionSortBy: string = Configuration.explorer.subscriptionSortBy;
    explorer.subscriptionTree.sort(subscriptionSortBy, subscriptionAscending);

    return Promise.all([
      explorer.gistTree.refresh(),
      explorer.subscriptionTree.refresh()
    ]);
  })
  .finally(() => {
    VSCode.execute('setContext', 'ExtensionLoaded', true);
  });
}
