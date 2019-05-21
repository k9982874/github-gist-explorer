import * as nls from 'vscode-nls';
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

import { commands, window } from 'vscode';

import * as clipboardy from 'clipboardy';


import * as path from 'path';

import * as api from './gist-api';
import * as modules from './modules';
import * as constans from './constans';

import ConfigurationManager, { Configuration } from './configuration';

import { GistTreeProvider } from './tree-provider';

export class Shortcut {
	private save(config: Configuration, content: string, filename?: string): Promise<modules.Gist> {
		return api.listWaitable(config.gitHub.username)
			.then(results => {
				return window.showQuickPick<modules.Gist>(
					[ ...results, new modules.Gist() ],
					{ placeHolder: localize('explorer.pick_gist', 'Please pick a gist to add')}
				);
			})
			.then(gist => {
				if (gist === undefined) {
					const msg = localize('error.gist_required', 'Please pick a gist');
					return Promise.reject(new Error(msg));
				}

				const options = {
					value: filename === undefined ? '' : path.basename(filename),
					prompt: localize('explorer.add_file_name', 'Provide the name for new file here')
				}
				return window.showInputBox(options)
					.then(filename => {
						if (!filename) {
							const msg = localize('error.file_name_required', 'File name is required');
							return Promise.reject(new Error(msg));
						}
						return Promise.resolve([ gist.id, filename ]);
					});
			})
			.then(results => {
				const [ gistID, filename ] = results;

				if (gistID !== undefined) {
					return api.updateFileWaitable(gistID, filename, content);
				}

				const options = {
					prompt: localize('explorer.add_gist_description', 'Provide the description for your new gist here')
				}
				return window.showInputBox(options)
					.then(description => {
						return window.showQuickPick(
							[ constans.GistType.Public, constans.GistType.Secret ],
							{ placeHolder: localize('explorer.add_gist_type', 'Please decide the type for your new gist')}
						)
						.then(type => {
							if (!type) {
								const msg = localize('error.gist_type_required', 'Gist type is required');
								return Promise.reject(new Error(msg));
							}
							return Promise.resolve({ type, description });
						})
						.then(result => {
							const file = {
								name: filename,
								content
							}
							return api.addWaitable(result.type, result.description || '', [ file ]);
						});
					});
			});
	}

	saveIt(treeProvider: GistTreeProvider) {
		const editor = window.activeTextEditor;
		if (!editor) {
			const msg = localize('error.open_file', 'Forget open a file?');
			window.showInformationMessage(msg);
			return;
		}

		const content = editor.document.getText();
		if (content.trim().length === 0) {
			const msg = localize('error.empty_file', 'Can\'t save an empty file');
			window.showInformationMessage(msg);
			return;
		}

		ConfigurationManager.check()
			.then(config => {
				this.save(config, content, editor.document.fileName)
					.then(() => {
						treeProvider.refresh();
					})
					.catch(error => {
						window.showErrorMessage(error.message);
						return Promise.resolve();
					})
			})
			.catch(error => {
				window.showInformationMessage(error.message);
				commands.executeCommand('workbench.action.openSettings', `@ext:${constans.EXTENSION_ID}`)
			});
	}

	clipIt(treeProvider: GistTreeProvider) {
		const editor = window.activeTextEditor;
		if (!editor) {
			const msg = localize('explorer.open_file', 'Forget open a file?');
			window.showInformationMessage(msg);
			return;
		}

		const content = editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection);
		if (content.trim().length === 0) {
			const msg = localize('error.empty_selection', 'Select some text please');
			window.showInformationMessage(msg);
			return;
		}

		ConfigurationManager.check()
			.then(config => {
				return this.save(config, content, editor.document.fileName)
					.then(() => {
						treeProvider.refresh();
					})
					.catch(error => {
						window.showErrorMessage(error.message);
						return Promise.resolve();
					})
			})
			.catch(error => {
				window.showInformationMessage(error.message);
				commands.executeCommand('workbench.action.openSettings', `@ext:${constans.EXTENSION_ID}`)
			});
	}

	pasteIt(treeProvider: GistTreeProvider) {
		clipboardy.read()
			.then(content => {
				if (content.trim().length === 0) {
					const msg = localize('error.empty_clipboard', 'Nothing to paste');
					return Promise.reject(new Error(msg));
				}

				ConfigurationManager.check()
					.then(config => {
						return this.save(config, content)
							.then(() => {
								treeProvider.refresh();
							})
							.catch(error => {
								window.showErrorMessage(error.message);
								return Promise.resolve();
							})
					})
					.catch(error => {
						window.showInformationMessage(error.message);
						commands.executeCommand('workbench.action.openSettings', `@ext:${constans.EXTENSION_ID}`)
						return Promise.resolve();
					});
			})
			.catch(error => {
				window.showInformationMessage(error.message);
			})
	}
}
