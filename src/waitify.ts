import * as vscode from "vscode";

import promisify from "./promisify";

import * as constans from "./constans";

import i18n from "./i18n";

export default function waitify<T>(titleKey: string, func: (...argArray: any[]) => Promise<T>, thisArg?: any): (...argArray: any[]) => Promise<T> {
  const caller = function (...argArray: any[]): Thenable<T> {
    const text = i18n(titleKey);
    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `${constans.EXTENSION_NAME}: ${text}`,
    }, () => {
      return func.apply(thisArg, argArray);
    });
  };

  return promisify<T>(caller, thisArg);
}

export function loading<T>(titleKey: string, func: (...argArray: any[]) => Promise<T>, thisArg?: any, ...argArray: any[]): Promise<T> {
  return waitify<T>(titleKey, func, thisArg).apply(thisArg, argArray);
}

export function pending(titleKey: string): MethodDecorator {
  return function(target: Object, propertyKey: string, descriptor: any) {
    const method = descriptor.value;
    descriptor.value = function <T>(...argArray: any[]): Promise<T> {
      return waitify<T>(titleKey, method, this).apply(this, argArray);
    };
  };
}
