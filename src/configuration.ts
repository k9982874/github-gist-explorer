import i18n from './i18n';

import * as VSCode from './vscode';

import promisify from './promisify';

import * as constans from './constans';

export interface IGitHub {
  address: string;
  username: string;
  token: string;
}

export interface IExplorer {
  uploadOnSave: boolean;
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
    return VSCode.workspace.getConfiguration(`GithubGistExplorer.${scope}`).has(key) || VSCode.workspace.getConfiguration(scope).has(key);
  }

  private static get<T>(scope: string, key: string): T {
    if (this.has(scope, key)) {
      return VSCode.workspace.getConfiguration(`GithubGistExplorer.${scope}`).get<T>(key);
    }
    return VSCode.workspace.getConfiguration(scope).get<T>(key);
  }

  private static set<T>(scope: string, key: string, value: T): Promise<void> {
    return promisify(VSCode.workspace.getConfiguration(`GithubGistExplorer.${scope}`).update, VSCode.workspace)
      .call(VSCode.workspace, key, value, VSCode.ConfigurationTarget.Global);
  }

  public readonly github = new class implements IGitHub {
    get address(): string { return Configuration.get<string>('github', 'address') || constans.GITHUB_API_URL; }
    set address(value: string) { Configuration.set('github', 'address', value); }

    get username(): string { return Configuration.get<string>('github', 'username') || ''; }
    set username(value: string) { Configuration.set('github', 'username', value); }

    get token(): string { return Configuration.get<string>('github', 'token') || ''; }
    set token(value: string) { Configuration.set('github', 'token', value); }
  }();

  public readonly explorer = new class implements IExplorer {
    get uploadOnSave(): boolean { return Configuration.get<boolean>('explorer', 'uploadOnSave'); }
    set uploadOnSave(value: boolean) { Configuration.set('explorer', 'uploadOnSave', value); }

    get gistSortBy(): string { return Configuration.get<string>('explorer', 'gistSortBy'); }
    set gistSortBy(value: string) { Configuration.set('explorer', 'gistSortBy', value); }

    get gistAscending(): boolean { return Configuration.get<boolean>('explorer', 'gistAscending'); }
    set gistAscending(value: boolean) { Configuration.set('explorer', 'gistAscending', value); }

    get subscriptionSortBy(): string { return Configuration.get<string>('explorer', 'subscriptionSortBy'); }
    set subscriptionSortBy(value: string) { Configuration.set('explorer', 'subscriptionSortBy', value); }

    get subscriptionAscending(): boolean { return Configuration.get<boolean>('explorer', 'subscriptionAscending'); }
    set subscriptionAscending(value: boolean) { Configuration.set('explorer', 'subscriptionAscending', value); }

    get subscriptions(): string[] { return Configuration.get<string[]>('explorer', 'subscriptions'); }
    set subscriptions(value: string[]) { Configuration.set('explorer', 'subscriptions', value); }
  }();

  public readonly import = new class implements IImport {
    get excludes(): string[] { return Configuration.get<string[]>('import', 'excludes'); }
    set excludes(value: string[]) { Configuration.set('import', 'excludes', value); }
  }();

  check(): Promise<IConfiguration> {
    if (this.github.username.length === 0) {
      const msg = i18n('error.github_username_missing');
      return Promise.reject(new Error(msg));
    }

    if (this.github.token.length === 0) {
      const msg = i18n('error.github_token_missing');
      return Promise.reject(new Error(msg));
    }

    return Promise.resolve(this);
  }

  affects(event: VSCode.ConfigurationChangeEvent): string[] {
    const changes: string[] = [];
    if (event.affectsConfiguration('GithubGistExplorer.github.username')) {
      changes.push('GithubGistExplorer.github.username');
    }

    if (event.affectsConfiguration('GithubGistExplorer.github.username')) {
      changes.push('GithubGistExplorer.github.token');
    }

    if (event.affectsConfiguration('GithubGistExplorer.explorer.subscriptions')) {
      changes.push('GithubGistExplorer.explorer.subscriptions');
    }

    return changes;
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
        VSCode.info(error.message);
        VSCode.execute('workbench.action.openSettings', `@ext:${constans.EXTENSION_ID}`);
        return Promise.resolve();
      });
  };
}
