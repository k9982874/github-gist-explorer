"use strict";

import i18n from "./i18n";

import { extensions, ConfigurationChangeEvent, ExtensionContext, TextDocument, Uri } from "vscode";

import { Subscriber, Extension, Command, Event, TextDocumentContentProvider, TreeDataProvider, WebviewPanel } from "vscode-extension-decorator";

import { VSCode } from "./promisify";

import * as clipboardy from "clipboardy";

import * as constans from "./constans";
import * as filesystem from "./filesystem";
import * as api from "./api";

import { IGist, IFile } from "./modules";

import ConfigurationManager from "./configuration";

import ShortCut from "./shortCut";

import ContentProvider from "./contentProvider";
import GistTreeProvider, { GistTreeItem, GistTreeSortBy } from "./treeProvider";
import HistoryViewProvider from "./historyProvider";

@Extension
export class GitHubGistExplorer extends Subscriber {
  @TextDocumentContentProvider("GitHubGistContent")
  public readonly contentProvider: ContentProvider = new ContentProvider();

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
    const username: string = ConfigurationManager.getGitHub("username");

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
      ascending = ConfigurationManager.get("ascending") === "True";
    }

    Promise.all([
        ConfigurationManager.set("sortBy", sortBy),
        ConfigurationManager.set("ascending", ascending ? "True" : "False")
      ])
      .then(() => {
        this.treeProvider.sort(sortBy, ascending);
        VSCode.executeCommand("setContext", "ascending", ascending);
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.sortByLabel")
  sortByLabel() {
    const sortBy: string = ConfigurationManager.get("sortBy");
    if (sortBy !== GistTreeSortBy.Label) {
      this.sort(GistTreeSortBy.Label);
    }
  }

  @Command("GitHubGistExplorer.sortByLastUpdated")
  sortByLastUpdated() {
    const sortBy: string = ConfigurationManager.get("sortBy");
    if (sortBy !== GistTreeSortBy.LastUpdated) {
      this.sort(GistTreeSortBy.LastUpdated);
    }
  }

  @Command("GitHubGistExplorer.sortByCreated")
  sortByCreated() {
    const sortBy: string = ConfigurationManager.get("sortBy");
    if (sortBy !== GistTreeSortBy.Created) {
      this.sort(GistTreeSortBy.Created);
    }
  }

  @Command("GitHubGistExplorer.ascending")
  ascending() {
    const sortBy: string = ConfigurationManager.get("sortBy");
    this.sort(sortBy, false);
  }

  @Command("GitHubGistExplorer.descending")
  descending() {
    const sortBy: string = ConfigurationManager.get("sortBy");
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
          .then(selectedType => {
            if (!selectedType) {
              const msg = i18n("error.gist_type_required");
              return Promise.reject(new Error(msg));
            }
            return Promise.resolve({
              type: selectedType === pub ? constans.GistType.Public : constans.GistType.Secret,
              description
            });
          });
      })
      .then(result => {
        return api.addWaitable(result.type, result.description || "");
      })
      .then(() => {
        this.treeProvider.refresh();
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
        return api.updateWaitable(gist.id, value || "");
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

    const text = i18n("explorer.deleting_gist_confirmation", gist.label);
    VSCode.showWarningMessage(text, { modal: true }, "Ok")
      .then(value => {
        if (value === "Ok") {
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

  @Command("GitHubGistExplorer.paste")
  paste(node: GistTreeItem) {
    clipboardy.read()
      .then(content => {
        if (content.trim().length === 0) {
          const msg = i18n("error.empty_clipboard");
          VSCode.showInformationMessage(msg);
        } else {
          this.addFile(node, content);
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.addFile")
  addFile(node: GistTreeItem, content?: string) {
    const options = {
      prompt: i18n("explorer.add_file_name")
    };
    VSCode.showInputBox(options)
      .then(filename => {
        if (!filename) {
          const msg = i18n("error.file_name_required");
          return Promise.reject(new Error(msg));
        }

        const gist = node.metadata as IGist;
        return api.updateFileWaitable(gist.id, filename, content === undefined ? filename : content);
      })
      .then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
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

    const text = i18n("explorer.deleting_file_confirmation", file.filename);
    VSCode.showWarningMessage(text, { modal: true }, "Ok")
      .then(value => {
        if (value === "Ok") {
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
          const msg = i18n("error.file_name_required");
          return Promise.reject(new Error(msg));
        }
        return api.renameFileWaitable(file.gistID, file.filename, value);
      })
      .then(() => {
        const home: string = this.getHomeDirectory();
        return filesystem.rmrf(`${home}/${file.gistID}/${file.filename}`);
      })
      .then(() => {
        this.treeProvider.refresh();
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

  const sortBy: string = ConfigurationManager.get("sortBy");
  const ascending: boolean = ConfigurationManager.get("ascending") === "True";

  VSCode.executeCommand("setContext", "ascending", ascending)
    .then(() => {
      explorer.treeProvider.sort(sortBy, ascending);
      return explorer.treeProvider.refresh();
    })
    .finally(() => {
      VSCode.executeCommand("setContext", "loaded", true);
    });
}
