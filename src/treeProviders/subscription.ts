import { Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";

import * as api from "../api";
import * as VSCode from "../vscode";

import Configuration from "../configuration";

import { pending } from "../waitify";

import { IGist, IUser } from "../modules";
import { ITreeProvider, TreeSortBy, UserTreeItem, GistTreeItem, FileTreeItem, compareFn } from "./common";

type Node = UserTreeItem | GistTreeItem | FileTreeItem;

export class SubscriptionTreeProvider implements ITreeProvider, TreeDataProvider<Node> {
  private readonly onDidChangeTreeDataEmitter: EventEmitter<Node | undefined> = new EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData: Event<Node | undefined> = this.onDidChangeTreeDataEmitter.event;

  private readonly users: Map<string, IUser> = new Map();
  private readonly items: Map<string, IGist[]> = new Map();

  @pending("explorer.retrieve_user")
  refresh(): Promise<void> {
    this.items.clear();

    const tasks = Configuration.explorer.subscriptions.map(v => api.retrieveUser(v));
    return Promise.all(tasks)
      .then(users => {
        users.forEach(v => {
          this.users.set(v.login, v);
        });

        Configuration.explorer.subscriptions.forEach(v => {
          this.items.set(v, []);
        });

        this.sort();
      });
  }

  sort(sortBy?: string, ascending?: boolean) {
    if (sortBy === undefined) {
      sortBy = Configuration.explorer.subscriptionSortBy;
    } else {
      Configuration.explorer.subscriptionSortBy = sortBy;
    }

    if (ascending === undefined) {
      ascending = Configuration.explorer.subscriptionAscending;
    } else {
      Configuration.explorer.subscriptionAscending = ascending;
    }

    VSCode.executeCommand("setContext", "SubscriptionAscending", ascending);

    const fn = compareFn(sortBy, ascending);
    for (const key of this.items.keys()) {
      const items = this.items.get(key).sort(fn);
      this.items.set(key, items);
    }

    this.onDidChangeTreeDataEmitter.fire();
  }

  sortByLabel() {
    const sortBy: string = Configuration.explorer.subscriptionSortBy;
    if (sortBy !== TreeSortBy.Label) {
      this.sort(TreeSortBy.Label);
    }
  }

  sortByLastUpdated() {
    const sortBy: string = Configuration.explorer.subscriptionSortBy;
    if (sortBy !== TreeSortBy.LastUpdated) {
      this.sort(TreeSortBy.LastUpdated);
    }
  }

  sortByCreated() {
    const sortBy: string = Configuration.explorer.subscriptionSortBy;
    if (sortBy !== TreeSortBy.Created) {
      this.sort(TreeSortBy.Created);
    }
  }

  ascending() {
    const sortBy: string = Configuration.explorer.subscriptionSortBy;
    this.sort(sortBy, false);
  }

  descending() {
    const sortBy: string = Configuration.explorer.subscriptionSortBy;
    this.sort(sortBy, true);
  }

  getTreeItem(element: Node): TreeItem {
    return element;
  }

  getChildren(element?: Node): Node[] | Promise<Node[]> {
    if (element) {
      switch (element.contextValue) {
        case "User":
          if (this.items.has(element.label)) {
            const items = this.items.get(element.label);
            if (items.length > 0) {
              return items.map(v => new GistTreeItem(v));
            }

            return api.listWaitable(element.label)
              .then(results => {
                this.items.set(element.label, results);

                return results.map(v => {
                  return new GistTreeItem(v);
                });
              });
          }
          return [];
        case "Gist":
          return (element as GistTreeItem).metadata.files.map(f => {
            const command = {
              command: "GitHubGistExplorer.viewFile",
              title: "View File"
            };
            return new FileTreeItem(f, command);
          });
      }
    } else {
      const items = [];
      for (const v of this.users.values()) {
        items.push(new UserTreeItem(v));
      }

      const ascending = Configuration.explorer.subscriptionAscending;

      return items.sort((a, b) => {
        const [x, y] = ascending ? [a, b] : [b, a];
        if (x.label < y.label) {
          return -1;
        } else if (x.label > y.label) {
          return 1;
        }
        return 0;
      });
    }
  }
}
