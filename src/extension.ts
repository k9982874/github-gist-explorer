"use strict";

import * as nls from "vscode-nls";
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

import { commands, extensions, window, workspace, ConfigurationChangeEvent, ExtensionContext, TextDocument, Uri, WebviewPanel } from "vscode";

import promisify from "./promisify";

import * as clipboardy from "clipboardy";

import * as constans from "./constans";
import * as filesystem from "./filesystem";
import * as api from "./api";

import { IGist, IFile } from "./modules";

import ConfigurationManager from "./configuration";

import GistTreeProvider, { GistTreeItem, GistTreeSortBy } from "./treeProvider";
import HistoryPanel from "./historyPanel";
import ShortCut from "./shortCut";

import { Subscriber, Extension, Command, Event, TreeDataProvider, WebviewPanelSerializer } from "./subscriber";

@Extension
export class GitHubGistExplorer extends Subscriber {
  @TreeDataProvider("GitHubGistExplorer")
  public readonly treeProvider: GistTreeProvider = new GistTreeProvider();

  public readonly shortcut: ShortCut = new ShortCut();

  public readonly documentsSaving: string[] = new Array();

  public readonly executeCommand: any;

  public readonly showErrorMessage: any;
  public readonly showWarningMessage: any;
  public readonly showInformationMessage: any;

  public readonly showInputBox: any;
  public readonly showQuickPick: any;
  public readonly showTextDocument: any;
  public readonly openTextDocument: any;

  @WebviewPanelSerializer("GitHubGistHistory")
  public readonly serializer = {
    deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any): Thenable<void> {
      HistoryPanel.currentPanel = new HistoryPanel(webviewPanel);
      return;
    }
  };

  constructor(context: ExtensionContext) {
    super(context);

    this.executeCommand = promisify(commands.executeCommand, commands);

    this.showErrorMessage = promisify(window.showErrorMessage, window);
    this.showWarningMessage = promisify(window.showWarningMessage, window);
    this.showInformationMessage = promisify(window.showInformationMessage, window);

    this.showInputBox = promisify(window.showInputBox, window);
    this.showQuickPick = promisify(window.showQuickPick, window);
    this.showTextDocument = promisify(window.showTextDocument, window);
    this.openTextDocument = promisify(workspace.openTextDocument, workspace);
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
        this.executeCommand("setContext", "ascending", ascending);
      })
      .catch(error => {
        this.showErrorMessage(error.message);
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
      prompt: localize("explorer.add_gist_description", "Provide the description for your new gist here")
    };
    this.showInputBox(options)
      .then(description => {
        return this.showQuickPick(
            [ constans.GistType.Public, constans.GistType.Secret ],
            { placeHolder: localize("explorer.add_gist_type", "Please decide the type for your new gist")}
          )
          .then(type => {
            if (!type) {
              const msg = localize("error.gist_type_required", "Gist type is required");
              return Promise.reject(new Error(msg));
            }
            return Promise.resolve({ type, description });
          });
      })
      .then(result => {
        return api.addWaitable(result.type, result.description || "");
      })
      .then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        this.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.editGist")
  editGist(node: GistTreeItem) {
    const gist: IGist = node.metadata as IGist;

    const options = {
      value: gist.description,
      prompt: localize("explorer.edit_gist_description", "Provide the description for gist here")
    };
    this.showInputBox(options)
      .then(value => {
        return api.updateWaitable(gist.id, value || "");
      })
      .then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        this.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.deleteGist")
  deleteGist(node: GistTreeItem) {
    const gist: IGist = node.metadata as IGist;
    this.showWarningMessage(`Are you sure to delete gist ${node.label}?`, { modal: true }, "Ok")
      .then(value => {
        if (value === "Ok") {
          return api.destroyWaitable(gist.id);
        } else {
          return Promise.resolve();
        }
      })
      .then(() => {
        const home: string = this.getHomeDirectory();
        return filesystem.rmrf(`${home}/${gist.id}`);
      }).then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        this.showErrorMessage(error.message);
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
        this.showErrorMessage(error.message);
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
        this.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.history")
  history(node: GistTreeItem) {
    const a = Uri.parse("https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/4d75db8c53208176a61faacacafa80bbdf598db2/extensions.json");
    const b = Uri.parse("https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/a4dbb3d5fe7d7193e3813302c8f0845a702579f1/extensions.json");

    this.executeCommand("vscode.diff", a, b, "diff", { preview: true });

    HistoryPanel.show((node.metadata as IGist).id);
    /*
		api.retrieveWaitable(gist.id)
			.then(data => {
				HistoryPanel.show(data);
				console.log(data);
			})
			.catch(error => {
				this.showErrorMessage(error.message);
			});
		*/
  }

  @Command("GitHubGistExplorer.paste")
  paste(node: GistTreeItem) {
    clipboardy.read()
      .then(content => {
        if (content.trim().length === 0) {
          const msg = localize("error.empty_clipboard", "Nothing to paste");
          this.showInformationMessage(msg);
        } else {
          this.addFile(node, content);
        }
      })
      .catch(error => {
        this.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.addFile")
  addFile(node: GistTreeItem, content?: string) {
    const options = {
      prompt: localize("explorer.add_file_name", "Provide the name for new file here")
    };
    this.showInputBox(options)
      .then(filename => {
        if (!filename) {
          const msg = localize("error.file_name_required", "File name is required");
          return Promise.reject(new Error(msg));
        }

        const gist = node.metadata as IGist;
        return api.updateFileWaitable(gist.id, filename, content === undefined ? filename : content);
      })
      .then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        this.showErrorMessage(error.message);
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
          return this.openTextDocument(uri);
        } else {
          return api.getFileWaitable(file.rawURL)
            .then(content => {
              if (typeof content === "object") {
                return filesystem.writefile(filename, JSON.stringify(content));
              } else if (typeof content === "string") {
                return filesystem.writefile(filename, content);
              } else {
                const msg = localize("error.unknown_file_format", "Unknown file format");
                return Promise.reject(new Error(msg));
              }
            })
            .then(() => {
              const uri = Uri.file(filename);
              return this.openTextDocument(uri);
            });
        }
      })
      .then(doc => {
        this.showTextDocument(doc, { preview: true });
      })
      .catch(error => {
        this.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.deleteFile")
  deleteFile(node: GistTreeItem) {
    const file: IFile = node.metadata as IFile;
    api.deleteFileWaitable(file.gistID, file.filename)
      .then(() => {
        const home: string = this.getHomeDirectory();
        return filesystem.rmrf(`${home}/${file.gistID}/${file.filename}`);
      })
      .then(() => {
        this.treeProvider.refresh();
      })
      .catch(error => {
        this.showErrorMessage(error.message);
      });
  }

  @Command("GitHubGistExplorer.renameFile")
  renameFile(node: GistTreeItem) {
    const file: IFile = node.metadata as IFile;

    const options = {
      value: file.filename,
      prompt: localize("explorer.rename_file_name", "Provide the name for file here")
    };
    this.showInputBox(options)
      .then(value => {
        if (!value) {
          const msg = localize("error.file_name_required", "File name is required");
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
        this.showErrorMessage(error.message);
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
          const msg = localize("error.unknown_file_format", "Unknown file format");
          return Promise.reject(new Error(msg));
        }
      })
      .then(() => {
        const uri = Uri.file(filename);
        return this.openTextDocument(uri);
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
        this.showErrorMessage(error.message);
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

  explorer.executeCommand("setContext", "ascending", ascending)
    .then(() => {
      explorer.treeProvider.sort(sortBy, ascending);
      return explorer.treeProvider.refresh();
    })
    .finally(() => {
      explorer.executeCommand("setContext", "loaded", true);
    });

  return explorer;
}
