import * as vscode from "vscode";

import promisify from "./promisify";

export default function waitfiy<T>(text: string, func: (...argArray: any[]) => Promise<T>, thisArg?: any): (...argArray: any[]) => Promise<T> {
  const caller = function (...argArray: any[]): Thenable<T> {
    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: text,
    }, () => {
      return func.apply(thisArg, argArray);
    });
  };

  return promisify(caller, thisArg);
}

export function waiting<T>(text: string, func: (...argArray: any[]) => Promise<T>, thisArg?: any, ...argArray: any[]): Promise<T> {
  return waitfiy<T>(text, func, thisArg).apply(thisArg, argArray);
}
