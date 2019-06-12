import i18n from "./i18n";

import { workspace, ConfigurationChangeEvent, ConfigurationTarget } from "vscode";

import promisify from "./promisify";

import * as VSCode from "./vscode";

import * as constans from "./constans";

export interface IGitHub {
  username: string;
  token: string;
}

export interface IExplorer {
  gistSortBy: string;
  gistAscending: boolean;
  subscriptionSortBy: string;
  subscriptionAscending: boolean;
  subscriptions: string[];
}

export interface IImport {
  excludes: string[];
}

export interface IConfiguration {
  github: IGitHub;
  explorer: IExplorer;
  import: IImport;
}

export class Configuration implements IConfiguration {
  private static has(scope: string, key: string): boolean {
    return workspace.getConfiguration(`GithubGistExplorer.${scope}`).has(key) || workspace.getConfiguration(scope).has(key);
  }

  private static get<T>(scope: string, key: string): T {
    if (this.has(scope, key)) {
      return workspace.getConfiguration(`GithubGistExplorer.${scope}`).get<T>(key);
    }
    return workspace.getConfiguration(scope).get<T>(key);
  }

  private static set<T>(scope: string, key: string, value: T): Promise<void> {
    return promisify(workspace.getConfiguration(`GithubGistExplorer.${scope}`).update, workspace)
      .call(workspace, key, value, ConfigurationTarget.Global);
  }

  public readonly github = new class implements IGitHub {
    get username(): string { return Configuration.get<string>("github", "username") || ""; }
    set username(value: string) { Configuration.set("github", "username", value); }

    get token(): string { return Configuration.get<string>("github", "token") || ""; }
    set token(value: string) { Configuration.set("github", "token", value); }
  }();

  public readonly explorer = new class implements IExplorer {
    get gistSortBy(): string { return Configuration.get<string>("explorer", "gistSortBy"); }
    set gistSortBy(value: string) { Configuration.set("explorer", "gistSortBy", value); }

    get gistAscending(): boolean { return Configuration.get<boolean>("explorer", "gistAscending"); }
    set gistAscending(value: boolean) { Configuration.set("explorer", "gistAscending", value); }

    get subscriptionSortBy(): string { return Configuration.get<string>("explorer", "subscriptionSortBy"); }
    set subscriptionSortBy(value: string) { Configuration.set("explorer", "subscriptionSortBy", value); }

    get subscriptionAscending(): boolean { return Configuration.get<boolean>("explorer", "subscriptionAscending"); }
    set subscriptionAscending(value: boolean) { Configuration.set("explorer", "subscriptionAscending", value); }

    get subscriptions(): string[] { return Configuration.get<string[]>("explorer", "subscriptions"); }
    set subscriptions(value: string[]) { Configuration.set("explorer", "subscriptions", value); }
  }();

  public readonly import = new class implements IImport {
    get excludes(): string[] { return Configuration.get<string[]>("import", "excludes"); }
    set excludes(value: string[]) { Configuration.set("import", "excludes", value); }
  }();

  check(): Promise<IConfiguration> {
    if (this.github.username.length === 0) {
      const msg = i18n("error.github_username_missing");
      return Promise.reject(new Error(msg));
    }

    if (this.github.token.length === 0) {
      const msg = i18n("error.github_token_missing");
      return Promise.reject(new Error(msg));
    }

    return Promise.resolve(this);
  }

  affects(event: ConfigurationChangeEvent): string {
    if (event.affectsConfiguration("GithubGistExplorer.github.username")) {
      return "GithubGistExplorer.github.username";
    }

    if (event.affectsConfiguration("GithubGistExplorer.github.username")) {
      return "GithubGistExplorer.github.token";
    }

    if (event.affectsConfiguration("GithubGistExplorer.explorer.subscriptions")) {
      return "GithubGistExplorer.explorer.subscriptions";
    }

    return undefined;
  }
}

const instance = new Configuration();
export default instance;

export function validate(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<Function>) {
  const method = descriptor.value;
  descriptor.value = function (...argArray: any[]) {
    return instance.check()
      .then(config => {
        return method.apply(this, argArray);
      })
      .catch(error => {
        VSCode.showInformationMessage(error.message);
        VSCode.executeCommand("workbench.action.openSettings", `@ext:${constans.EXTENSION_ID}`);
        return Promise.resolve();
      });
  };
}
