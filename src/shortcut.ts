import i18n from "./i18n";

import { window, workspace, Uri } from "vscode";

import * as path from "path";

import * as clipboardy from "clipboardy";

import * as filesystem from "./filesystem";

import * as constans from "./constans";
import * as api from "./api";
import * as VSCode from "./vscode";

import { waiting } from "./waitfiy";

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
        if (!gist) {
          const msg = i18n("error.gist_required");
          return Promise.reject(new Error(msg));
        }

        const options = {
          value: filename ? path.basename(filename) : "",
          prompt: i18n("explorer.add_file_name")
        };
        return VSCode.showInputBox(options)
          .then(filename => {
            if (!filename) {
              const msg = i18n("error.file_name_required");
              return Promise.reject(new Error(msg));
            }
            return Promise.resolve({ gistID: gist.id, filename });
          });
      })
      .then(({ gistID, filename }) => {
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
            .then(({ type, description }) => {
              const file = { name: filename, content };
              return api.addWaitable(type, description || "", [ file ]);
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

  importFolder(treeProvider: GistTreeProvider) {
    ConfigurationManager.check()
      .then(config => {
        const options = {
          defaultUri: undefined,
          openLabel: i18n("explorer.import"),
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false
        };

        if (workspace.rootPath) {
          options.defaultUri = Uri.file(workspace.rootPath);
        }

        return VSCode.showOpenDialog(options)
          .then(uris => {
            if (!uris || uris.length === 0) {
              return Promise.resolve({});
            }

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
                  return Promise.resolve({});
                }

                return Promise.resolve({
                  type: selected === pub ? constans.GistType.Public : constans.GistType.Secret,
                  basePath: uris.shift().path
                });
              });
          })
          .then(({ type, basePath }) => {
            if (!type || !basePath) {
              return Promise.resolve(undefined);
            }

            return filesystem.walkdir(basePath, ConfigurationManager.import.excludes)
              .then(result => {
                const tasks = result.map(v => {
                  return filesystem.readfile(v)
                    .then(content => {
                      const filename = v.substring(basePath.length + 1).replace(/\//g, "_");
                      return Promise.resolve({
                        filename,
                        content
                      });
                    });
                });

                return Promise.resolve(tasks);
              })
              .then(tasks => {
                if (tasks.length === 0) {
                  return Promise.resolve(undefined);
                }

                return waiting<IGist>(i18n("explorer.importing_files"), () => {
                    return Promise.all(tasks)
                      .then(files => {
                        const name = path.basename(basePath);
                        return api.add(type, name, files);
                      });
                  });
              });
          })
          .then(gist => {
            if (gist) {
              VSCode.message("explorer.import_completed").showInformationMessage();
              treeProvider.refresh();
            } else {
              VSCode.message("explorer.import_cancelled").showWarningMessage();
            }
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
