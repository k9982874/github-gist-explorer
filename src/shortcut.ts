import i18n from './i18n';

import * as VSCode from './vscode';

import * as path from 'path';

import * as clipboardy from 'clipboardy';

import * as filesystem from './filesystem';

import * as constans from './constans';
import * as api from './api';

import { loading } from './waitify';

import { ITreeProvider } from './treeProviders';

import { IGist, IFile } from './modules';

import Configuration, { validate } from './configuration';
export default class ShortCut {
  constructor(public readonly treeProvider: ITreeProvider<IGist>) {
  }

  private async save(content: string, filename?: string): Promise<IGist> {
    const label = i18n('explorer.new_gist');

    const gist = await VSCode.showQuickPick<IGist>(
      [ { id: '', label, alwaysShow: true }, ...this.treeProvider.items ],
      { placeHolder: i18n('explorer.pick_gist')}
    );

    if (gist === undefined) {
      VSCode.message('error.gist_required').warn();
      return;
    }

    filename = await VSCode.showInputBox({
      value: filename ? path.basename(filename) : '',
      prompt: i18n('explorer.add_file_name')
    });
    if (filename === undefined) {
      VSCode.message('error.file_name_required').warn();
      return;
    }

    // add file into exists gist
    if (gist.id.length > 0) {
      return await api.updateFileWaitable(gist.id, filename, content);
    }

    const description = await VSCode.showInputBox({
      prompt: i18n('explorer.add_gist_description')
    });

    const pub: string = i18n('explorer.public');
    const sec: string = i18n('explorer.secret');

    const selected = await VSCode.showQuickPick(
      [ pub, sec ],
      { placeHolder: i18n('explorer.add_gist_type')}
    );

    if (!selected) {
      VSCode.message('error.gist_type_required').warn();
      return;
    }

    const type = selected === pub ? constans.GistType.Public : constans.GistType.Secret;
    return await api.addWaitable(type, description, [{ filename, content }]);
  }

  @validate
  async saveFile() {
    const editor = VSCode.window.activeTextEditor;
    if (!editor) {
      VSCode.message('error.open_file').warn();
      return;
    }

    const content = editor.document.getText();
    if (content.trim().length === 0) {
      VSCode.message('error.empty_file').warn();
      return;
    }

    try {
      const gist = await this.save(content, editor.document.fileName);
      if (gist) {
        this.treeProvider.refresh();
      }
    } catch (err) {
      VSCode.error(err.message);
    }
  }

  @validate
  async clipSelection() {
    const editor = VSCode.window.activeTextEditor;
    if (!editor) {
      VSCode.message('error.open_file').warn();
      return;
    }

    const content = editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection);
    if (content.trim().length === 0) {
      VSCode.message('error.empty_selection').warn();
      return;
    }

    try {
      const gist = await this.save(content, editor.document.fileName);
      if (gist) {
        this.treeProvider.refresh();
      }
    } catch (err) {
      VSCode.error(err.message);
    }
  }

  @validate
  async pasteClipboard() {
    const content = await clipboardy.read();
    if (content.trim().length === 0) {
      VSCode.message('error.empty_clipboard').warn();
      return;
    }

    try {
      const gist = await this.save(content);
      if (gist) {
        this.treeProvider.refresh();
      }
    } catch (err) {
      VSCode.error(err.message);
    }
  }

  @validate
  async importFolder() {
    try {
      const options = {
        defaultUri: undefined,
        openLabel: i18n('explorer.import'),
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false
      };

      if (VSCode.workspace.rootPath) {
        options.defaultUri = VSCode.Uri.file(VSCode.workspace.rootPath);
      }

      const uris = await VSCode.showOpenDialog(options);
      if ((uris === undefined) || (uris.length === 0)) {
        VSCode.message('explorer.import_cancelled').warn();
        return;
      }

      const basePath = uris.shift().path;

      const pub: string = i18n('explorer.public');
      const sec: string = i18n('explorer.secret');

      const selected = await VSCode.showQuickPick(
        [ pub, sec ],
        { placeHolder: i18n('explorer.add_gist_type') }
      );

      if (selected === undefined) {
        VSCode.message('error.gist_type_required').warn();
        return;
      }

      const type = selected === pub ? constans.GistType.Public : constans.GistType.Secret;

      const tasks = (await filesystem.walkdir(basePath, Configuration.import.excludes)).map(v => {
        return filesystem.readfile(v)
          .then(content => {
            const filename = v.substring(basePath.length + 1).replace(/\//g, '_');
            return { filename, content };
          });
      });

      if (tasks.length === 0) {
        VSCode.message('explorer.import_cancelled').warn();
        return;
      }

      const gist = await loading<IGist>('explorer.importing_files', () => {
        return Promise.all(tasks)
          .then(files => {
            const name = path.basename(basePath);
            return api.add(type, name, files);
          });
      });

      if (gist) {
        this.treeProvider.refresh();
      }
    } catch (err) {
      VSCode.error(err.message);
    }
  }
}
