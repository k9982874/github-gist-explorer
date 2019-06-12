"use strict";

import i18n from "./i18n";

import { extensions, ConfigurationChangeEvent, ExtensionContext, TextDocument, Uri } from "vscode";

import { Subscriber, Extension, Command, Event, TextDocumentContentProvider, TreeDataProvider, WebviewPanel } from "vscode-extension-decorator";

import * as path from "path";

import * as clipboardy from "clipboardy";

import * as filesystem from "./filesystem";

import * as constans from "./constans";
import * as api from "./api";
import * as VSCode from "./vscode";

import { IGist, IFile } from "./modules";

import { loading } from "./waitify";

import Configuration from "./configuration";

import ShortCut from "./shortcut";

import HistoryViewProvider from "./historyProvider";
import ContentProvider from "./contentProvider";

import { GistTreeItem, FileTreeItem, GistTreeProvider, SubscriptionTreeProvider } from "./treeProviders";

@Extension
export class GitHubGistExplorer extends Subscriber {
  @WebviewPanel("GistHistory")
  public readonly historyView: HistoryViewProvider = new HistoryViewProvider();

  @TextDocumentContentProvider("FileContent")
  public readonly contentProvider: ContentProvider = new ContentProvider();

  @TextDocumentContentProvider("ExportReport")
  public readonly exportReportProvider: ContentProvider = new ContentProvider();

  @Command("GitHubGistExplorer.GistTree.sortByLabel", "sortByLabel")
  @Command("GitHubGistExplorer.GistTree.sortByLastUpdated", "sortByLastUpdated")
  @Command("GitHubGistExplorer.GistTree.sortByCreated", "sortByCreated")
  @Command("GitHubGistExplorer.GistTree.ascending", "ascending")
  @Command("GitHubGistExplorer.GistTree.descending", "descending")
  @TreeDataProvider("GistTree")
  public readonly gistTree: GistTreeProvider = new GistTreeProvider();

  @Command("GitHubGistExplorer.SubscriptionTree.sortByLabel", "sortByLabel")
  @Command("GitHubGistExplorer.SubscriptionTree.sortByLastUpdated", "sortByLastUpdated")
  @Command("GitHubGistExplorer.SubscriptionTree.sortByCreated", "sortByCreated")
  @Command("GitHubGistExplorer.SubscriptionTree.ascending", "ascending")
  @Command("GitHubGistExplorer.SubscriptionTree.descending", "descending")
  @TreeDataProvider("SubscriptionTree")
  public readonly subscriptionTree: SubscriptionTreeProvider = new SubscriptionTreeProvider();

  @Command("GitHubGistExplorer.shortcut.saveIt", "saveIt")
  @Command("GitHubGistExplorer.shortcut.clipIt", "clipIt")
  @Command("GitHubGistExplorer.shortcut.pasteIt", "pasteIt")
  @Command("GitHubGistExplorer.shortcut.importFolder", "importFolder")
  public readonly shortcut: ShortCut = new ShortCut(this.gistTree);

  public readonly documentsSaving: string[] = new Array();

  constructor(context: ExtensionContext) {
    super(context);
  }

  getHomeDirectory(): string {
    const extensionPath: string = extensions.getExtension(constans.EXTENSION_ID).extensionPath;
    const username: string = Configuration.github.username;

    return `${extensionPath}/${username}`;
  }

  @Command("GitHubGistExplorer.GistTree.refresh")
  @Command("GitHubGistExplorer.SubscriptionTree.refresh")
  refresh(commandId: string) {
    if (commandId === "GitHubGistExplorer.SubscriptionTree.refresh") {
      this.subscriptionTree.refresh();
    } else {
      const home: string = this.getHomeDirectory();
      filesystem.rmrf(home).finally(() => {
        this.gistTree.refresh();
      });
    }
  }

  @Command("GitHubGistExplorer.shortcut.newGist")
  @Command("GitHubGistExplorer.GistTree.addGist")
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
  editGist(node: GistTreeItem) {
    const gist: IGist = node.metadata;

    const options = {
      value: gist.label,
      prompt: i18n("explorer.edit_gist_description")
    };
    VSCode.showInputBox(options)
      .then(value => {
        return api.updateWaitable(gist.id, value);
      })
      .then(() => {
        this.gistTree.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.deleteGist")
  deleteGist(node: GistTreeItem) {
    const gist: IGist = node.metadata;

    VSCode.message("explorer.deleting_gist_confirmation", gist.label).showWarningMessage({ modal: true }, i18n("explorer.ok"))
      .then(reply => {
        if (reply) {
          return api.destroyWaitable(gist.id)
            .then(() => {
              const home: string = this.getHomeDirectory();
              return filesystem.rmrf(`${home}/${gist.id}`);
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
  starGist(node: GistTreeItem) {
    const gist: IGist = node.metadata;
    api.starWaitable(gist.id)
      .then(() => {
        const home: string = this.getHomeDirectory();
        return filesystem.rmrf(`${home}/${gist.id}`);
      }).then(() => {
        this.gistTree.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.unstarGist")
  unstarGist(node: GistTreeItem) {
    const gist: IGist = node.metadata;
    api.unstarWaitable(gist.id)
      .then(() => {
        const home: string = this.getHomeDirectory();
        return filesystem.rmrf(`${home}/${gist.id}`);
      }).then(() => {
        this.gistTree.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.history")
  history(node: GistTreeItem) {
    HistoryViewProvider.show(node.metadata);
  }

  @Command("GitHubGistExplorer.exportGist")
  exportGist(node: GistTreeItem) {
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
          return api.downloadFileWaitable(file.rawURL)
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
          const data = Buffer.from(results.join("\n")).toString("base64");
          const uri = Uri.parse(`ExportReport:${node.label}.log?${data}`);
          VSCode.showTextDocument(uri);
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.paste")
  paste(node: GistTreeItem) {
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
  addFile(node: GistTreeItem) {
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
          return filesystem.readfile(v.path)
            .then(content => {
              return Promise.resolve({
                filename: path.basename(v.path),
                content
              });
            });
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
  editFile(node: FileTreeItem) {
    const file: IFile = node.metadata;

    const home: string = this.getHomeDirectory();
    const path = `${home}/${file.gistID}`;
    const filename = `${path}/${file.filename}`;

    filesystem.exists(path)
      .then(exists => {
        if (exists) {
          return Promise.resolve();
        } else {
          return filesystem.mkdir(path);
        }
      })
      .then(() => {
        return filesystem.exists(filename);
      })
      .then(exists => {
        if (exists) {
          const uri = Uri.file(filename);
          return VSCode.openTextDocument(uri);
        } else {
          return api.downloadFileWaitable(file.rawURL)
            .then(content => {
              if (typeof content === "object") {
                return filesystem.writefile(filename, JSON.stringify(content));
              } else if (typeof content === "string") {
                return filesystem.writefile(filename, content);
              } else {
                const msg = i18n("error.unknown_file_format");
                return Promise.reject(new Error(msg));
              }
            })
            .then(() => {
              const uri = Uri.file(filename);
              return VSCode.openTextDocument(uri);
            });
        }
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

    const uri = Uri.parse(`FileContent:${file.filename}?${file.rawURL}`);
    VSCode.showTextDocument(uri, { preview: true });
  }

  @Command("GitHubGistExplorer.deleteFile")
  deleteFile(node: FileTreeItem) {
    const file: IFile = node.metadata;

    VSCode.message("explorer.deleting_file_confirmation", file.filename).showWarningMessage({ modal: true }, i18n("explorer.ok"))
      .then(reply => {
        if (reply) {
          return api.deleteFileWaitable(file.gistID, file.filename)
            .then(() => {
              const home: string = this.getHomeDirectory();
              return filesystem.rmrf(`${home}/${file.gistID}/${file.filename}`);
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
  renameFile(node: FileTreeItem) {
    const file: IFile = node.metadata;

    const options = {
      value: file.filename,
      prompt: i18n("explorer.rename_file_name")
    };
    VSCode.showInputBox(options)
      .then(value => {
        if (!value) {
          VSCode.message("error.file_name_required").showWarningMessage();
          return;
        }
        return api.renameFileWaitable(file.gistID, file.filename, value)
          .then(() => {
            const home: string = this.getHomeDirectory();
            return filesystem.rmrf(`${home}/${file.gistID}/${file.filename}`);
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
  reloadFile(node: FileTreeItem) {
    const file: IFile = node.metadata;

    const home: string = this.getHomeDirectory();
    const path = `${home}/${file.gistID}`;
    const filename = `${path}/${file.filename}`;

    api.downloadFileWaitable(file.rawURL)
      .then(content => {
        if (typeof content === "object") {
          return filesystem.writefile(filename, JSON.stringify(content));
        } else if (typeof content === "string") {
          return filesystem.writefile(filename, content);
        } else {
          const msg = i18n("error.unknown_file_format");
          return Promise.reject(new Error(msg));
        }
      })
      .then(() => {
        const uri = Uri.file(filename);
        return VSCode.openTextDocument(uri);
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Event("onDidChangeConfiguration")
  didChangeConfigurationHandle(event: ConfigurationChangeEvent) {
    const changes = Configuration.affects(event);
    if (changes !== undefined) {
      if (changes === "GithubGistExplorer.explorer.subscriptions") {
        this.subscriptionTree.refresh();
      } else {
        const home: string = this.getHomeDirectory();
        filesystem.rmrf(home).finally(() => {
          this.gistTree.refresh();
        });
      }
    }
  }

  @Event("onDidSaveTextDocument")
  didSaveTextDocumentHandle(doc: TextDocument) {
    const home: string = this.getHomeDirectory();
    if (!doc.fileName.startsWith(home)) {
      return;
    }

    const filename: string = doc.fileName.slice(home.length + 1);

    const [ gistID, name ] = filename.split("/");
    if (!gistID || !name) {
      return;
    }

    const fileIndex = this.documentsSaving.indexOf(filename);
    if (fileIndex !== -1) {
      return;
    }

    this.documentsSaving.push(filename);

    api.updateFileWaitable(gistID, name, doc.getText())
      .catch(error => {
        VSCode.showErrorMessage(error.message);
        return Promise.resolve();
      })
      .finally(() => {
        this.documentsSaving.splice(fileIndex, 1);
      });
  }
}

export function activate(context: ExtensionContext) {
  const explorer = new GitHubGistExplorer(context);

  const gistSortBy: string = Configuration.explorer.gistSortBy;
  const gistAscending: boolean = Configuration.explorer.gistAscending;

  const subscriptionSortBy: string = Configuration.explorer.subscriptionSortBy;
  const subscriptionAscending: boolean = Configuration.explorer.subscriptionAscending;

  Promise.all([
    VSCode.executeCommand("setContext", "GistAscending", gistAscending),
    VSCode.executeCommand("setContext", "SubscriptionAscending", subscriptionAscending)
  ])
  .then(() => {
    explorer.gistTree.sort(gistSortBy, gistAscending);
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
