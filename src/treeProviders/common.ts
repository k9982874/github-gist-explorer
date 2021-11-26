import * as path from 'path';

import { Command, TreeItem, TreeItemCollapsibleState, Uri } from '../vscode';

import { IUser, IGist, IFile } from '../modules';

export enum TreeSortBy {
  Label = 'Label',
  LastUpdated = 'Last Updated',
  Created = 'Created',
}

export interface ITreeProvider<T> {
  readonly items: T[];

  refresh(): void | Promise<void>;

  sortByLabel();

  sortByLastUpdated();
  sortByCreated();

  ascending();

  descending();
}

export class UserTreeItem extends TreeItem {
  constructor(readonly metadata: IUser) {
    super(metadata.login, TreeItemCollapsibleState.Collapsed);

    this.contextValue = 'User';

    this.id = metadata.id;
    this.description = metadata.profile.name;

    if (metadata.avatarURL) {
      this.iconPath = Uri.parse(metadata.avatarURL);
    } else {
      this.iconPath = {
        light: path.join(__filename, process.env.ASSET_PATH, 'light/user.svg'),
        dark: path.join(__filename, process.env.ASSET_PATH, 'dark/user.svg')
      };
    }
  }
}

export class GistTreeItem extends TreeItem {
  constructor(
    public readonly metadata: IGist,
    public readonly starred?: boolean
  ) {
    super(metadata.label, TreeItemCollapsibleState.Collapsed);

    this.tooltip = this.metadata.url;
    this.description = this.metadata.description;

    if (starred) {
      this.contextValue = 'GistStarrd';

      this.iconPath = {
        light: path.join(__filename, process.env.ASSET_PATH, 'light/star.svg'),
        dark: path.join(__filename, process.env.ASSET_PATH, 'dark/star.svg')
      };
    } else {
      this.contextValue = 'Gist';

      if (!metadata.public) {
        this.iconPath = {
          light: path.join(__filename, process.env.ASSET_PATH, 'light/folder-lock.svg'),
          dark: path.join(__filename, process.env.ASSET_PATH, 'dark/folder-lock.svg')
        };
      }
    }
  }

  iconPath = {
    light: path.join(__filename, process.env.ASSET_PATH, 'light/folder.svg'),
    dark: path.join(__filename, process.env.ASSET_PATH, 'dark/folder.svg')
  };
}

export class FileTreeItem extends TreeItem {
  constructor(public readonly metadata: IFile, command?: Command) {
    super(metadata.filename, TreeItemCollapsibleState.None);

    this.contextValue = 'File';

    this.tooltip = this.metadata.rawURL;
    this.description = this.metadata.type;

    if (command) {
      this.command = command;
    } else {
      this.command = {
        command: 'GitHubGistExplorer.editFile',
        title: 'Edit File'
      };
    }
    this.command.arguments = [this];
  }

  iconPath = {
    light: path.join(__filename, process.env.ASSET_PATH, 'light/snippet.svg'),
    dark: path.join(__filename, process.env.ASSET_PATH, 'dark/snippet.svg')
  };
}

export function compareFn(sortBy: string, ascending: boolean) {
  let key = 'updatedAt';
  switch (sortBy) {
    case TreeSortBy.Label:
      key = 'label';
      break;
    case TreeSortBy.Created:
      key = 'createdAt';
      break;
  }

  return function (a, b) {
    const [x, y] = ascending ? [a, b] : [b, a];

    if (typeof x[key].diff === 'function') {
      return x[key].diff(y[key]);
    }

    if (x[key] < y[key]) {
      return -1;
    } else if (x[key] > y[key]) {
      return 1;
    }
    return 0;
  };
}
