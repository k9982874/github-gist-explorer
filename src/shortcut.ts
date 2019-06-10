import i18n from "./i18n";

import { window, Uri } from "vscode";

import * as path from "path";

import * as clipboardy from "clipboardy";

import * as filesystem from "./filesystem";

import * as constans from "./constans";
import * as api from "./api";
import * as VSCode from "./vscode";

import { IGist } from "./modules";

import GistModule from "./modules/gist";

import ConfigurationManager, { IConfiguration } from "./configuration";

import GistTreeProvider from "./treeProvider";

export default class ShortCut {
  private save(config: IConfiguration, content: string, filename?: string): Promise<IGist> {
    return api.listWaitable(config.github.username)
      .then(results => {
        return VSCode.showQuickPick<IGist>(
          [ ...results, new GistModule() ],
          { placeHolder: i18n("explorer.pick_gist")}
        );
      })
      .then((gist: IGist) => {
        if (gist === undefined) {
          const msg = i18n("error.gist_required");
          return Promise.reject(new Error(msg));
        }

        const options = {
          value: filename === undefined ? "" : path.basename(filename),
          prompt: i18n("explorer.add_file_name")
        };
        return VSCode.showInputBox(options)
          .then(filename => {
            if (!filename) {
              const msg = i18n("error.file_name_required");
              return Promise.reject(new Error(msg));
            }
            return Promise.resolve([ gist.id, filename ]);
          });
      })
      .then(results => {
        const [ gistID, filename ] = results;

        if (gistID) {
          return api.updateFileWaitable(gistID, filename, content);
        }

        const options = {
          prompt: i18n("explorer.add_gist_description")
        };
        return VSCode.showInputBox(options)
          .then(description => {
            return VSCode.showQuickPick(
              [ constans.GistType.Public, constans.GistType.Secret ],
              { placeHolder: i18n("explorer.add_gist_type")}
            )
            .then(type => {
              if (!type) {
                const msg = i18n("error.gist_type_required");
                return Promise.reject(new Error(msg));
              }
              return Promise.resolve({ type, description });
            })
            .then(result => {
              const file = {
                name: filename,
                content
              };
              return api.addWaitable(result.type, result.description || "", [ file ]);
            });
          });
      });
  }

  saveIt(treeProvider: GistTreeProvider) {
    const editor = window.activeTextEditor;
    if (!editor) {
      VSCode.message("error.open_file").showWarningMessage();
      return;
    }

    const content = editor.document.getText();
    if (content.trim().length === 0) {
      VSCode.message("error.empty_file").showWarningMessage();
      return;
    }

    ConfigurationManager.check()
      .then(config => {
        this.save(config, content, editor.document.fileName)
          .then(() => {
            treeProvider.refresh();
          })
          .catch(error => {
            VSCode.showErrorMessage(error.message);
            return Promise.resolve();
          });
      })
      .catch(error => {
        VSCode.showWarningMessage(error.message);
        VSCode.executeCommand("workbench.action.openSettings", `@ext:${constans.EXTENSION_ID}`);
      });
  }

  clipIt(treeProvider: GistTreeProvider) {
    const editor = window.activeTextEditor;
    if (!editor) {
      VSCode.message("error.open_file").showWarningMessage();
      return;
    }

    const content = editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection);
    if (content.trim().length === 0) {
      VSCode.message("error.empty_selection").showWarningMessage();
      return;
    }

    ConfigurationManager.check()
      .then(config => {
        return this.save(config, content, editor.document.fileName)
          .then(() => {
            treeProvider.refresh();
          })
          .catch(error => {
            VSCode.showErrorMessage(error.message);
            return Promise.resolve();
          });
      })
      .catch(error => {
        VSCode.showWarningMessage(error.message);
        VSCode.executeCommand("workbench.action.openSettings", `@ext:${constans.EXTENSION_ID}`);
      });
  }

  pasteIt(treeProvider: GistTreeProvider) {
    clipboardy.read()
      .then(content => {
        if (content.trim().length === 0) {
          VSCode.message("error.empty_clipboard").showWarningMessage();
          return;
        }

        ConfigurationManager.check()
          .then(config => {
            return this.save(config, content)
              .then(() => {
                treeProvider.refresh();
              })
              .catch(error => {
                VSCode.showErrorMessage(error.message);
                return Promise.resolve();
              });
          })
          .catch(error => {
            VSCode.showWarningMessage(error.message);
            VSCode.executeCommand("workbench.action.openSettings", `@ext:${constans.EXTENSION_ID}`);
          });
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  importFolder() {
    ConfigurationManager.check()
      .then(config => {
        const options = {
          openLabel: i18n("explorer.import"),
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false
        };
        return VSCode.showOpenDialog(options)
          .then(uris => {
            if (!uris || uris.length === 0) {
              return Promise.resolve([]);
            }

            const basePath = uris.shift().path;
            return filesystem.walkdir(basePath);
          })
          .then(results => {
            filesystem.writefile('/tmp/log', results.join("\n"));
          })
          .catch(error => {
            VSCode.showErrorMessage(error.message);
          });
      })
      .catch(error => {
        VSCode.showWarningMessage(error.message);
        VSCode.executeCommand("workbench.action.openSettings", `@ext:${constans.EXTENSION_ID}`);
      });
  }
}
