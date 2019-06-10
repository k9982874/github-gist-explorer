import { commands, window, workspace } from "vscode";

import promisify from "./promisify";

import i18n from "./i18n";

export class MessageChain {
  private text: string;

  constructor(key: string, ...args: any[]) {
    this.text = i18n(key, ...args);
  }

  showErrorMessage<T>(...argArray: any[]) {
    argArray.unshift(this.text);
    return promisify<T>(window.showErrorMessage, window).apply(window, argArray);
  }

  showWarningMessage<T>(...argArray: any[]) {
    argArray.unshift(this.text);
    return promisify<T>(window.showWarningMessage, window).apply(window, argArray);
  }

  showInformationMessage<T>(...argArray: any[]) {
    argArray.unshift(this.text);
    return promisify<T>(window.showInformationMessage, window).apply(window, argArray);
  }
}

export function message(key: string, ...args: any[]): MessageChain {
  return new MessageChain(key, ...args);
}

export function executeCommand<T>(...argArray: any[]) {
  return promisify<T>(commands.executeCommand, commands).apply(commands, argArray);
}

export function showErrorMessage<T>(...argArray: any[]) {
  return promisify<T>(window.showErrorMessage, window).apply(window, argArray);
}

export function showWarningMessage<T>(...argArray: any[]) {
  return promisify<T>(window.showWarningMessage, window).apply(window, argArray);
}

export function showInformationMessage<T>(...argArray: any[]) {
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
