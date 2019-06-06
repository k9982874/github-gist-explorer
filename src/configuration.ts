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
  gitHub: IGitHub;
  explorer: IExplorer;
  import: IImport;
}

export class ConfigurationManager {
  check(): Promise<IConfiguration> {
    const username: string = this.get("github", "username") || "";
    if (username.length === 0) {
      const msg = i18n("error.github_username_missing");
      return Promise.reject(new Error(msg));
    }

    const token: string = this.get("github", "token") || "";
    if (token.length === 0) {
      const msg = i18n("error.github_token_missing");
      return Promise.reject(new Error(msg));
    }

    const conf: IConfiguration = {
      gitHub: {
        username,
        token,
      },
      explorer: {
        sortBy: this.get("explorer", "sortBy"),
        ascending: this.get<boolean>("explorer", "ascending"),
      },
      import: {
        excludes: this.get("import", "excludes")
      }
    };

    return Promise.resolve(conf);
  }

  affects(event: ConfigurationChangeEvent) {
    return event.affectsConfiguration("GithubGistExplorer.github.username") || event.affectsConfiguration("GithubGistExplorer.github.token");
  }

  get<T>(scope: string, key: string): T {
    return workspace.getConfiguration(`GithubGistExplorer.${scope}`).get<T>(key);
  }

  set(scope: string, key: string, value: any): Promise<void> {
    return promisify(workspace.getConfiguration(`GithubGistExplorer.${scope}`).update, workspace)(key, value, ConfigurationTarget.Global);
  }
}

export default new ConfigurationManager();
