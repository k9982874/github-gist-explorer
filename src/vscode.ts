import { commands, window, workspace } from "vscode";

import promisify from "./promisify";

import i18n from "./i18n";

export class MessageChain {
  private text: string;

  constructor(key: string, ...args: any[]) {
    this.text = i18n(key, ...args);
  }

  showErrorMessage<T>(...argArray: any[]) {
    argArray[0] = this.text;
    return promisify<T>(window.showErrorMessage, window).apply(argArray, argArray);
  }

  showWarningMessage<T>(...argArray: any[]) {
    argArray[0] = this.text;
    return promisify<T>(window.showWarningMessage, window).apply(argArray, argArray);
  }

  showInformationMessage<T>(...argArray: any[]) {
    argArray[0] = this.text;
    return promisify<T>(window.showInformationMessage, window).apply(argArray, argArray);
  }
}

export default class VSCode {
  static i18n(key: string, ...args: any[]): MessageChain {
    return new MessageChain(key, ...args);
  }

  static executeCommand<T>(...argArray: any[]) {
    return promisify<T>(commands.executeCommand, commands).apply(commands, argArray);
  }

  static showErrorMessage<T>(...argArray: any[]) {
    return promisify<T>(window.showErrorMessage, window).apply(argArray, argArray);
  }

  static showWarningMessage<T>(...argArray: any[]) {
    return promisify<T>(window.showWarningMessage, window).apply(argArray, argArray);
  }

  static showInformationMessage<T>(...argArray: any[]) {
    return promisify<T>(window.showInformationMessage, window).apply(argArray, argArray);
  }

  static readonly showInputBox = promisify(window.showInputBox, window);

  static showQuickPick<T>(...argArray: any[]) {
    return promisify<T>(window.showQuickPick, window).apply(argArray, argArray);
  }

  static readonly showOpenDialog = promisify(window.showOpenDialog, window);
  static readonly showSaveDialog = promisify(window.showSaveDialog, window);

  static readonly showTextDocument = promisify(window.showTextDocument, window);

  static readonly openTextDocument = promisify(workspace.openTextDocument, workspace);
}
