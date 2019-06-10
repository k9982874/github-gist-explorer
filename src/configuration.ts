import i18n from "./i18n";

import { workspace, ConfigurationChangeEvent, ConfigurationTarget } from "vscode";

import promisify from "./promisify";

export interface IGitHub {
  username: string;
  token: string;
}

export interface IExplorer {
  sortBy: string;
  ascending: boolean;
}

export interface IImport {
  excludes: string[];
}

export interface IConfiguration {
  github: IGitHub;
  explorer: IExplorer;
  import: IImport;
}

export class ConfigurationManager implements IConfiguration {
  private static has(scope: string, key: string): boolean {
    return workspace.getConfiguration(`GithubGistExplorer.${scope}`).has(key)|| workspace.getConfiguration(scope).has(key);
  }

  private static get<T>(scope: string, key: string): T {
    return workspace.getConfiguration(`GithubGistExplorer.${scope}`).get<T>(key) || workspace.getConfiguration(scope).get<T>(key);
  }

  private static set(scope: string, key: string, value: any): Promise<IConfiguration> {
    return promisify(workspace.getConfiguration(`GithubGistExplorer.${scope}`).update, workspace)
      .call(this, key, value, ConfigurationTarget.Global)
      .then(() => {
        this[scope][key] = value;
        return Promise.resolve(this);
      });
  }

  public readonly github = new class implements IGitHub {
    get username(): string { return ConfigurationManager.get<string>("github", "username") || ""; }
    set username(value: string) { ConfigurationManager.set("github", "username", value); }

    get token(): string { return ConfigurationManager.get<string>("github", "token") || ""; }
    set token(value: string) { ConfigurationManager.set("github", "token", value); }
  }();

  public readonly explorer = new class implements IExplorer {
    get sortBy(): string { return ConfigurationManager.get<string>("explorer", "sortBy"); }
    set sortBy(value: string) { ConfigurationManager.set("explorer", "sortBy", value); }

    get ascending(): boolean { return ConfigurationManager.get<boolean>("explorer", "ascending"); }
    set ascending(value: boolean) { ConfigurationManager.set("explorer", "ascending", value); }
  }();

  public readonly import = new class implements IImport {
    get excludes(): string[] { return ConfigurationManager.get<string[]>("import", "excludes"); }
    set excludes(value: string[]) { ConfigurationManager.set("import", "excludes", value); }
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

  affects(event: ConfigurationChangeEvent) {
    return event.affectsConfiguration("GithubGistExplorer.github.username") || event.affectsConfiguration("GithubGistExplorer.github.token");
  }
}

const instance = new ConfigurationManager();
export default instance;
