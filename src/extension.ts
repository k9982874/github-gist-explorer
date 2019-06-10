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

import { waiting } from "./waitfiy";

import ConfigurationManager from "./configuration";

import ShortCut from "./shortcut";

import ContentProvider from "./contentProvider";
import GistTreeProvider, { GistTreeItem, GistTreeSortBy } from "./treeProvider";
import HistoryViewProvider from "./historyProvider";

@Extension
export class GitHubGistExplorer extends Subscriber {
  @TextDocumentContentProvider("GitHubGistHistoryContent")
  public readonly contentProvider: ContentProvider = new ContentProvider();

  @TextDocumentContentProvider("GitHubGistExportReport")
  public readonly exportReportProvider: ContentProvider = new ContentProvider();

  @TreeDataProvider("GitHubGistExplorer")
  public readonly treeProvider: GistTreeProvider = new GistTreeProvider();

  @WebviewPanel("GitHubGistHistory")
  public readonly historyView: HistoryViewProvider = new HistoryViewProvider();

  public readonly shortcut: ShortCut = new ShortCut();

  public readonly documentsSaving: string[] = new Array();

  constructor(context: ExtensionContext) {
    super(context);
  }

  getHomeDirectory(): string {
    const extensionPath: string = extensions.getExtension(constans.EXTENSION_ID).extensionPath;
    const username: string = ConfigurationManager.github.username;

    return `${extensionPath}/${username}`;
  }

  @Command("GitHubGistExplorer.refresh")
  refresh() {
    const home: string = this.getHomeDirectory();
    filesystem.rmrf(home).finally(() => {
      this.treeProvider.refresh();
    });
  }

  sort(sortBy: string, ascending?: boolean) {
    if (ascending === undefined) {
      ascending = ConfigurationManager.explorer.ascending;
    }

    ConfigurationManager.explorer.sortBy = sortBy;
    ConfigurationManager.explorer.ascending = ascending;

    this.treeProvider.sort(sortBy, ascending);

    VSCode.executeCommand("setContext", "ascending", ascending);
  }

  @Command("GitHubGistExplorer.sortByLabel")
  sortByLabel() {
    const sortBy: string = ConfigurationManager.explorer.sortBy;
    if (sortBy !== GistTreeSortBy.Label) {
      this.sort(GistTreeSortBy.Label);
    }
  }

  @Command("GitHubGistExplorer.sortByLastUpdated")
  sortByLastUpdated() {
    const sortBy: string = ConfigurationManager.explorer.sortBy;
    if (sortBy !== GistTreeSortBy.LastUpdated) {
      this.sort(GistTreeSortBy.LastUpdated);
    }
  }

  @Command("GitHubGistExplorer.sortByCreated")
  sortByCreated() {
    const sortBy: string = ConfigurationManager.explorer.sortBy;
    if (sortBy !== GistTreeSortBy.Created) {
      this.sort(GistTreeSortBy.Created);
    }
  }

  @Command("GitHubGistExplorer.ascending")
  ascending() {
    const sortBy: string = ConfigurationManager.explorer.sortBy;
    this.sort(sortBy, false);
  }

  @Command("GitHubGistExplorer.descending")
  descending() {
    const sortBy: string = ConfigurationManager.explorer.sortBy;
    this.sort(sortBy, true);
  }

  @Command("GitHubGistExplorer.shortcut.saveIt")
  saveIt() {
    this.shortcut.saveIt(this.treeProvider);
  }

  @Command("GitHubGistExplorer.shortcut.clipIt")
  clipIt() {
    this.shortcut.clipIt(this.treeProvider);
  }

  @Command("GitHubGistExplorer.shortcut.pasteIt")
  pasteIt() {
    this.shortcut.pasteIt(this.treeProvider);
  }

  @Command("GitHubGistExplorer.shortcut.importFolder")
  importIt() {
    this.shortcut.importFolder();
  }

  @Command("GitHubGistExplorer.shortcut.newGist")
  @Command("GitHubGistExplorer.addGist")
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
            {
              placeHolder: i18n("explorer.add_gist_type")
            }
          )
          .then(selected => {
            if (!selected) {
              VSCode.message("error.gist_type_required").showWarningMessage();
              return;
            }

            const type = selected === pub ? constans.GistType.Public : constans.GistType.Secret;
            return Promise.resolve({ type, description})
              .then(result => {
                return api.addWaitable(result.type, result.description);
              })
              .then(() => {
                this.treeProvider.refresh();
              });
        });
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.editGist")
  editGist(node: GistTreeItem) {
    const gist: IGist = node.metadata as IGist;

    const options = {
      value: gist.label,
      prompt: i18n("explorer.edit_gist_description")
    };
    VSCode.showInputBox(options)
      .then(value => {
        return api.updateWaitable(gist.id, value);
      })
      .then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.deleteGist")
  deleteGist(node: GistTreeItem) {
    const gist: IGist = node.metadata as IGist;

    VSCode.message("explorer.deleting_gist_confirmation", gist.label).showWarningMessage({ modal: true }, i18n("explorer.ok"))
      .then(value => {
        if (value) {
          return api.destroyWaitable(gist.id)
            .then(() => {
              const home: string = this.getHomeDirectory();
              return filesystem.rmrf(`${home}/${gist.id}`);
            }).then(() => {
              this.treeProvider.refresh();
            });
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.starGist")
  starGist(node: GistTreeItem) {
    const gist: IGist = node.metadata as IGist;
    api.starWaitable(gist.id)
      .then(() => {
        const home: string = this.getHomeDirectory();
        return filesystem.rmrf(`${home}/${gist.id}`);
      }).then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.unstarGist")
  unstarGist(node: GistTreeItem) {
    const gist: IGist = node.metadata as IGist;
    api.unstarWaitable(gist.id)
      .then(() => {
        const home: string = this.getHomeDirectory();
        return filesystem.rmrf(`${home}/${gist.id}`);
      }).then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.history")
  history(node: GistTreeItem) {
    HistoryViewProvider.show(node.metadata as IGist);
  }

  @Command("GitHubGistExplorer.exportGist")
  exportGist(node: GistTreeItem) {
    const gist = node.metadata as IGist;

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
          return api.getFile(file.rawURL)
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
        return waiting(i18n("explorer.exporting_files"), () => Promise.all(tasks));
      })
      .then(results => {
        if (results.length === 0) {
          VSCode.message("explorer.export_cancelled").showWarningMessage();
          return;
        }

        return VSCode.message("explorer.export_completed").showInformationMessage(i18n("explorer.view_report"))
          .then(s => {
            if (s) {
              const data = Buffer.from(results.join("\n")).toString("base64");
              const uri = Uri.parse(`GitHubGistExportReport:${node.label}.log?${data}`);
              VSCode.showTextDocument(uri);
            }
          });
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
          return;
        }

        return this.createFile(node, content);
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

        const gist = node.metadata as IGist;
        return api.updateFileWaitable(gist.id, filename, content || i18n("explorer.empty_file"))
          .then(() => {
            this.treeProvider.refresh();
          });
      });
  }

  importFile(node: GistTreeItem) {
    const gist = node.metadata as IGist;

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
          return Promise.resolve(undefined);
        }

        return waiting<IGist>(i18n("explorer.importing_files"), () => {
            return Promise.all(tasks)
              .then(files => {
                return api.update(gist.id, undefined, files);
              });
          });
      })
      .then(gist => {
        if (gist) {
          VSCode.message("explorer.import_completed").showInformationMessage();
          this.treeProvider.refresh();
        } else {
          VSCode.message("explorer.import_cancelled").showWarningMessage();
        }
      });
  }

  @Command("GitHubGistExplorer.editFile")
  editFile(node: GistTreeItem) {
    const file: IFile = node.metadata as IFile;

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
          return api.getFileWaitable(file.rawURL)
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

  @Command("GitHubGistExplorer.deleteFile")
  deleteFile(node: GistTreeItem) {
    const file: IFile = node.metadata as IFile;

    VSCode.message("explorer.deleting_file_confirmation", file.filename).showWarningMessage({ modal: true }, i18n("explorer.ok"))
      .then(value => {
        if (value) {
          return api.deleteFileWaitable(file.gistID, file.filename)
            .then(() => {
              const home: string = this.getHomeDirectory();
              return filesystem.rmrf(`${home}/${file.gistID}/${file.filename}`);
            })
            .then(() => {
              this.treeProvider.refresh();
            });
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.renameFile")
  renameFile(node: GistTreeItem) {
    const file: IFile = node.metadata as IFile;

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
            this.treeProvider.refresh();
          });
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.reloadFile")
  reloadFile(node: GistTreeItem) {
    const file: IFile = node.metadata as IFile;

    const home: string = this.getHomeDirectory();
    const path = `${home}/${file.gistID}`;
    const filename = `${path}/${file.filename}`;

    api.getFileWaitable(file.rawURL)
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
    if (ConfigurationManager.affects(event)) {
      const home: string = this.getHomeDirectory();
      filesystem.rmrf(home).finally(() => {
        this.treeProvider.refresh();
      });
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

  const sortBy: string = ConfigurationManager.explorer.sortBy;
  const ascending: boolean = ConfigurationManager.explorer.ascending;

  VSCode.executeCommand("setContext", "ascending", ascending)
    .then(() => {
      explorer.treeProvider.sort(sortBy, ascending);
      return explorer.treeProvider.refresh();
    })
    .finally(() => {
      VSCode.executeCommand("setContext", "loaded", true);
    });
}
