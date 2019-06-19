"use strict";

import i18n from "./i18n";

import { ConfigurationChangeEvent, ExtensionContext, FileChangeEvent, FileChangeType, Uri } from "vscode";

import { Command, Event, Extension, FileSystemProvider, Subscriber, TextDocumentContentProvider, TreeDataProvider, WebviewPanel } from "vscode-extension-decorator";

import * as clipboardy from "clipboardy";

import * as filesystem from "./filesystem";

import * as constans from "./constans";
import * as api from "./api";
import * as VSCode from "./vscode";

import { loading } from "./waitify";

import { IGist, IFile } from "./modules";

import Configuration from "./configuration";

import GistFileSystemProvider from "./filesystemProvider";

import ShortCut from "./shortcut";

import HistoryViewProvider from "./historyProvider";
import ContentProvider from "./contentProvider";

import { UserTreeItem, GistTreeItem, FileTreeItem, GistTreeProvider, SubscriptionTreeProvider } from "./treeProviders";

import { GistSearch, SubscriptionSearch } from "./search";

@Extension
export class GitHubGistExplorer extends Subscriber {
  @FileSystemProvider("gistfs", { isCaseSensitive: process.platform === "linux" })
  public readonly gistFileSystem: GistFileSystemProvider = new GistFileSystemProvider();

  @WebviewPanel("GistHistory")
  public readonly historyView: HistoryViewProvider = new HistoryViewProvider();

  @TextDocumentContentProvider("GistFile")
  public readonly fileContentProvider: ContentProvider = new ContentProvider();

  @TextDocumentContentProvider("GistReport")
  public readonly reportContentProvider: ContentProvider = new ContentProvider();

  @TreeDataProvider("GistTree")
  @Command("GitHubGistExplorer.GistTree.sortByLabel", "sortByLabel")
  @Command("GitHubGistExplorer.GistTree.sortByLastUpdated", "sortByLastUpdated")
  @Command("GitHubGistExplorer.GistTree.sortByCreated", "sortByCreated")
  @Command("GitHubGistExplorer.GistTree.ascending", "ascending")
  @Command("GitHubGistExplorer.GistTree.descending", "descending")
  public readonly gistTree: GistTreeProvider = new GistTreeProvider();

  @TreeDataProvider("SubscriptionTree")
  @Command("GitHubGistExplorer.subscribeGist", "subscribe")
  @Command("GitHubGistExplorer.unsubscribeGist", "unsubscribe")
  @Command("GitHubGistExplorer.SubscriptionTree.sortByLabel", "sortByLabel")
  @Command("GitHubGistExplorer.SubscriptionTree.sortByLastUpdated", "sortByLastUpdated")
  @Command("GitHubGistExplorer.SubscriptionTree.sortByCreated", "sortByCreated")
  @Command("GitHubGistExplorer.SubscriptionTree.ascending", "ascending")
  @Command("GitHubGistExplorer.SubscriptionTree.descending", "descending")
  public readonly subscriptionTree: SubscriptionTreeProvider = new SubscriptionTreeProvider();

  @Command("GitHubGistExplorer.shortcut.saveIt", "saveIt")
  @Command("GitHubGistExplorer.shortcut.clipIt", "clipIt")
  @Command("GitHubGistExplorer.shortcut.pasteIt", "pasteIt")
  @Command("GitHubGistExplorer.shortcut.importFolder", "importFolder")
  public readonly shortcut: ShortCut = new ShortCut(this.gistTree);

  @Command("GitHubGistExplorer.shortcut.gistSearch", "show")
  public readonly gistSearch: GistSearch = new GistSearch(this.gistTree);

  @Command("GitHubGistExplorer.shortcut.subscriptionSearch", "show")
  public readonly subscriptionSearch: SubscriptionSearch = new SubscriptionSearch(this.subscriptionTree);

  constructor(context: ExtensionContext) {
    super(context);

    this.register(this.gistFileSystem.onDidChangeFile, this.gistFileSystem, this.didChangeFileHandle);
  }

  @Command("GitHubGistExplorer.GistTree.refresh")
  @Command("GitHubGistExplorer.SubscriptionTree.refresh")
  refresh(commandId: string) {
    if (commandId === "GitHubGistExplorer.SubscriptionTree.refresh") {
      this.subscriptionTree.refresh();
    } else {
      const home: string = GistFileSystemProvider.homeDirectory();
      filesystem.rmrf(home).finally(() => {
        this.gistTree.refresh();
      });
    }
  }

  @Command("GitHubGistExplorer.viewUser")
  viewUser(commandId: string, node: UserTreeItem) {
    VSCode.executeCommand("vscode.open", Uri.parse(node.metadata.htmlURL));
  }

  @Command("GitHubGistExplorer.addGist")
  @Command("GitHubGistExplorer.shortcut.newGist")
  addGist() {
    const options = {
      prompt: i18n("explorer.add_gist_description")
    };
    VSCode.showInputBox(options)
      .then(description => {
        const pub: string = i18n("explorer.public");
        const sec: string = i18n("explorer.secret");

        return VSCode.showQuickPick(
            [ pub, sec ],
            { placeHolder: i18n("explorer.add_gist_type")}
          )
          .then(selected => {
            if (selected) {
              const type = selected === pub ? constans.GistType.Public : constans.GistType.Secret;
              return Promise.resolve({ type, description });
            } else {
              return Promise.resolve({});
            }
        });
      })
      .then(({ type, description }) => {
        if (type === undefined) {
          VSCode.message("error.gist_type_required").showWarningMessage();
          return Promise.resolve(undefined);
        }
        return api.addWaitable(type, description);
      })
      .then(gist => {
        if (gist) {
          this.gistTree.refresh();
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.editGist")
  editGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;

    const options = {
      value: gist.label,
      prompt: i18n("explorer.edit_gist_description")
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
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.deleteGist")
  deleteGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;

    VSCode.message("explorer.deleting_gist_confirmation", gist.label).showWarningMessage({ modal: true }, i18n("explorer.ok"))
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
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.starGist")
  starGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;
    api.starWaitable(gist.id)
      .then(() => {
        this.gistTree.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.unstarGist")
  unstarGist(commandId: string, node: GistTreeItem) {
    const gist: IGist = node.metadata;
    api.unstarWaitable(gist.id)
      .then(() => {
        this.gistTree.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.history")
  history(commandId: string, node: GistTreeItem) {
    HistoryViewProvider.show(node.metadata);
  }

  @Command("GitHubGistExplorer.exportGist")
  exportGist(commandId: string, node: GistTreeItem) {
    const gist = node.metadata;

    const options = {
      openLabel: i18n("explorer.export"),
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false
    };
    VSCode.showOpenDialog(options)
      .then(uris => {
        if (!uris || uris.length === 0) {
          return Promise.resolve([]);
        }

        const path = uris.shift().path;

        const tasks = gist.files.map(file => {
          return api.downloadFile(file.rawURL)
            .then(content => {
              return filesystem.writefile(`${path}/${file.filename}`, content);
            })
            .then(() => {
              return Promise.resolve(new Date().toLocaleString() + ": " + i18n("explorer.export_succeed", file.filename));
            })
            .catch(error => {
              return Promise.resolve(new Date().toLocaleString() + ": " + i18n("explorer.export_failed", file.filename));
            });
        });
        return Promise.resolve(tasks);
      })
      .then(tasks => {
        if (tasks.length === 0) {
          VSCode.message("explorer.export_cancelled").showWarningMessage();
          return Promise.resolve(undefined);
        }
        return loading("explorer.exporting_files", () => Promise.all(tasks))
          .then(results => {
            return VSCode.message("explorer.export_completed").showInformationMessage(i18n("explorer.view_report"))
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
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.paste")
  paste(commandId: string, node: GistTreeItem) {
    clipboardy.read()
      .then(content => {
        if (content.trim().length === 0) {
          VSCode.message("error.empty_clipboard").showInformationMessage();
        } else {
          this.createFile(node, content);
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.addFile")
  addFile(commandId: string, node: GistTreeItem) {
    const importFile = i18n("explorer.import_file");
    const newFile = i18n("explorer.new_file");

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
        VSCode.showErrorMessage(error.message);
      });
  }

  createFile(node: GistTreeItem, content?: string) {
    const options = {
      prompt: i18n("explorer.add_file_name")
    };
    return VSCode.showInputBox(options)
      .then(filename => {
        if (!filename) {
          VSCode.message("error.file_name_required").showWarningMessage();
          return;
        }

        return api.updateFileWaitable(node.metadata.id, filename, content || i18n("explorer.empty_file"))
          .then(() => {
            this.gistTree.refresh();
          });
      });
  }

  importFile(node: GistTreeItem) {
    const options = {
      openLabel: i18n("explorer.import"),
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: true
    };
    return VSCode.showOpenDialog(options)
      .then(uris => {
        if (!uris || uris.length === 0) {
          return Promise.resolve([]);
        }

        const tasks = uris.map(v => {
          const filename = filesystem.basename(v.path);
          return filesystem.readfile(v.path)
            .then(content => Promise.resolve({ filename, content }));
        });
        return Promise.resolve(tasks);
      }).then(tasks => {
        if (tasks.length === 0) {
          VSCode.message("explorer.import_cancelled").showWarningMessage();
          return Promise.resolve(undefined);
        }

        return loading<IGist>("explorer.importing_files", () => {
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

  @Command("GitHubGistExplorer.editFile")
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
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.viewFile")
  viewFile(command: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    const uri = ContentProvider.parseFile(file.filename, file.rawURL);
    VSCode.showTextDocument(uri, { preview: true });
  }

  @Command("GitHubGistExplorer.deleteFile")
  deleteFile(commandId: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    VSCode.message("explorer.deleting_file_confirmation", file.filename).showWarningMessage({ modal: true }, i18n("explorer.ok"))
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
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.renameFile")
  renameFile(commandId: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    const options = {
      value: file.filename,
      prompt: i18n("explorer.rename_file_name")
    };
    VSCode.showInputBox(options)
      .then(value => {
        if (value === undefined) {
          return;
        }

        if (value.length === 0) {
          VSCode.message("error.file_name_required").showWarningMessage();
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
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.reloadFile")
  reloadFile(commandId: string, node: FileTreeItem) {
    const file: IFile = node.metadata;

    const uri = GistFileSystemProvider.parseFile(file);

    this.gistFileSystem.promise.delete(uri, { recursive: false })
      .then(() => {
        this.gistFileSystem.readFile(uri);
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Event("onDidChangeConfiguration")
  didChangeConfigurationHandle(eventId: string, event: ConfigurationChangeEvent) {
    const changes = Configuration.affects(event);
    if (changes.length > 0) {
      if (changes.includes("GithubGistExplorer.explorer.subscriptions")) {
        this.subscriptionTree.refresh();
      } else {
        const home: string = GistFileSystemProvider.homeDirectory();
        filesystem.rmrf(home).finally(() => {
          this.gistTree.refresh();
        });
      }
    }
  }

  didChangeFileHandle(events: FileChangeEvent[]) {
    events.forEach(e => {
      if (e.type === FileChangeType.Changed) {
        if (e.uri.scheme === "gistfs") {
          const [ gistID, filename ] = e.uri.path.substring(1).split("/");
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

export function activate(context: ExtensionContext) {
  const explorer = new GitHubGistExplorer(context);

  const gistAscending: boolean = Configuration.explorer.gistAscending;
  const subscriptionAscending: boolean = Configuration.explorer.subscriptionAscending;
  Promise.all([
    VSCode.executeCommand("setContext", "GistAscending", gistAscending),
    VSCode.executeCommand("setContext", "SubscriptionAscending", subscriptionAscending)
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
    VSCode.executeCommand("setContext", "ExtensionLoaded", true);
  });
}
