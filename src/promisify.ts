import { commands, window, workspace } from "vscode";

export default function promisify<T>(func: (...argArray: any[]) => Thenable<T>, thisArg?: any): (...argArray: any[]) => Promise<T> {
  return function (...argArray: any[]) {
    return new Promise<T>((resolve, reject) => {
      func.apply(thisArg, argArray).then(
        result => resolve(result),
        error => reject(error)
      );
    });
  };
}

export class VSCode {
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

  static readonly showTextDocument = promisify(window.showTextDocument, window);

  static readonly openTextDocument = promisify(workspace.openTextDocument, workspace);
}
