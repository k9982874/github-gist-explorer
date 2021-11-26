import i18n from './i18n';

import { commands, window, workspace } from 'vscode';

import promisify from './promisify';

import * as constans from './constans';

export {
  commands,
  extensions,
  window,
  workspace,
  CancellationToken,
  Command,
  ConfigurationChangeEvent,
  ConfigurationTarget,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  FileChangeEvent,
  FileChangeType,
  FileStat,
  FileSystemError,
  FileSystemProvider,
  FileType,
  ProgressLocation,
  ProviderResult,
  QuickPickItem,
  Range,
  TextDocumentContentProvider,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
  ViewColumn,
  WebviewPanel
} from 'vscode';

export class MessageChain {
  private text: string;

  constructor(key: string, ...args: any[]) {
    this.text = i18n(key, ...args);
  }

  error<T>(...argArray: any[]) {
    argArray.unshift(this.text);
    return error(...argArray);
  }

  warn<T>(...argArray: any[]) {
    argArray.unshift(this.text);
    return warn(...argArray);
  }

  info<T>(...argArray: any[]) {
    argArray.unshift(this.text);
    return info(...argArray);
  }
}

export function message(key: string, ...args: any[]): MessageChain {
  return new MessageChain(key, ...args);
}

export function execute<T>(...argArray: any[]) {
  return promisify<T>(commands.executeCommand, commands).apply(commands, argArray);
}

export function error<T>(...argArray: any[]) {
  const modal = (argArray.length > 1) && (argArray[1] instanceof Object) && argArray[1].modal;
  if (!modal) {
    argArray[0] = `${constans.EXTENSION_NAME}: ${argArray[0]}`;
  }
  return promisify<T>(window.showErrorMessage, window).apply(window, argArray);
}

export function warn<T>(...argArray: any[]) {
  const modal = (argArray.length > 1) && (argArray[1] instanceof Object) && argArray[1].modal;
  if (!modal) {
    argArray[0] = `${constans.EXTENSION_NAME}: ${argArray[0]}`;
  }
  return promisify<T>(window.showWarningMessage, window).apply(window, argArray);
}

export function info<T>(...argArray: any[]) {
  const modal = (argArray.length > 1) && (argArray[1] instanceof Object) && argArray[1].modal;
  if (!modal) {
    argArray[0] = `${constans.EXTENSION_NAME}: ${argArray[0]}`;
  }
  return promisify<T>(window.showInformationMessage, window).apply(window, argArray);
}

export const showInputBox = promisify(window.showInputBox, window);

export function showQuickPick<T>(...argArray: any[]) {
  return promisify<T>(window.showQuickPick, window).apply(window, argArray);
}

export const showOpenDialog = promisify(window.showOpenDialog, window);
export const showSaveDialog = promisify(window.showSaveDialog, window);

export const showTextDocument = promisify(window.showTextDocument, window);

export const openTextDocument = promisify(workspace.openTextDocument, workspace);
