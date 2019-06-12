import * as path from "path";

import { Command, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";

import { IUser, IGist, IFile } from "../modules";

export enum TreeSortBy {
  Label = "Label",
  LastUpdated = "Last Updated",
  Created = "Created",
}

export interface ITreeProvider {
  refresh(): void | Promise<void>;

  sortByLabel();

  sortByLastUpdated();
  sortByCreated();

  ascending();

  descending();
}

export class UserTreeItem extends TreeItem {
  constructor(user: IUser) {
    super(user.login, TreeItemCollapsibleState.Collapsed);

    this.contextValue = "User";

    this.description = user.profile.name;

    if (user.avatarURL) {
      this.iconPath = Uri.parse(user.avatarURL);
    } else {
      this.iconPath = {
        light: path.join(__filename, "../../../resources/light/user.svg"),
        dark: path.join(__filename, "../../../resources/dark/user.svg")
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

    if (starred) {
      this.contextValue = "GistStarrd";

      this.iconPath = {
        light: path.join(__filename, "../../../resources/light/star.svg"),
        dark: path.join(__filename, "../../../resources/dark/star.svg")
      };
    } else {
      this.contextValue = "Gist";

      if (!metadata.public) {
        this.iconPath = {
          light: path.join(__filename, "../../../resources/light/folder-lock.svg"),
          dark: path.join(__filename, "../../../resources/dark/folder-lock.svg")
        };
      }
    }
  }

  get tooltip(): string {
    return this.metadata.url;
  }

  get description(): string {
    return this.metadata.description;
  }

  iconPath = {
    light: path.join(__filename, "../../../resources/light/folder.svg"),
    dark: path.join(__filename, "../../../resources/dark/folder.svg")
  };
}

export class FileTreeItem extends TreeItem {
  constructor(public readonly metadata: IFile, command?: Command) {
    super(metadata.filename, TreeItemCollapsibleState.None);

    this.contextValue = "File";

    if (command) {
      this.command = command;
    } else {
      this.command = {
        command: "GitHubGistExplorer.editFile",
        title: "Edit File"
      };
    }
    this.command.arguments = [this];
  }

  get tooltip(): string {
    return this.metadata.rawURL;
  }

  get description(): string {
    return this.metadata.type;
  }

  iconPath = {
    light: path.join(__filename, "../../../resources/light/snippet.svg"),
    dark: path.join(__filename, "../../../resources/dark/snippet.svg")
  };
}

export function compareFn(sortBy: string, ascending: boolean) {
  let key = "updatedAt";
  switch (sortBy) {
    case TreeSortBy.Label:
      key = "label";
      break;
    case TreeSortBy.Created:
      key = "createdAt";
      break;
  }

  return function (a, b) {
    const [x, y] = ascending ? [a, b] : [b, a];

    if (typeof x[key].diff === "function") {
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
