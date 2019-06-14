import i18n from "../i18n";

import { Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";

import * as api from "../api";
import * as VSCode from "../vscode";

import Configuration from "../configuration";

import { pending, loading } from "../waitify";

import { IGist, IUser } from "../modules";
import { ITreeProvider, TreeSortBy, UserTreeItem, GistTreeItem, FileTreeItem, compareFn } from "./common";

type Node = UserTreeItem | GistTreeItem | FileTreeItem;

export class Subscription {
  private data: IGist[] = [];

  constructor(readonly user: IUser) {
  }

  get label(): string {
    return this.user.login;
  }

  get items(): IGist[] | Promise<IGist[]> {
    if (this.data.length > 0) {
      return this.data;
    }

    return api.list(this.label).then(items => this.data = items);
  }

  get length(): number {
    return this.data.length;
  }

  sort(compareFn?: (a: IGist, b: IGist) => number): Subscription {
    this.data = this.data.sort(compareFn);
    return this;
  }

  map<U>(callbackfn: (value: IGist, index: number, array: IGist[]) => U, thisArg?: any): U[] {
    return this.data.map<U>(callbackfn);
  }
}

export class SubscriptionTreeProvider implements ITreeProvider<Subscription>, TreeDataProvider<Node> {
  private readonly onDidChangeTreeDataEmitter: EventEmitter<Node | undefined> = new EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData: Event<Node | undefined> = this.onDidChangeTreeDataEmitter.event;

  readonly subscriptions: Map<string, Subscription> = new Map();

  get items(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  getTreeItem(element: Node): TreeItem {
    return element;
  }

  getChildren(element?: Node): Node[] | Promise<Node[]> {
    if (element) {
      switch (element.contextValue) {
        case "User":
          const items = this.subscriptions.get(element.id).items;
          if (items instanceof Promise) {
            return loading("explorer.listing_gist", () => items)
              .then(result => result.map(v => new GistTreeItem(v)));
          } else {
            return items;
          }
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
      const items = this.items.map(v => new UserTreeItem(v.user));

      const ascending = Configuration.explorer.subscriptionAscending;
      const compareFn = function (a, b) {
        const [x, y] = ascending ? [a, b] : [b, a];
        if (x.label < y.label) {
          return -1;
        } else if (x.label > y.label) {
          return 1;
        }
        return 0;
      };
      return items.sort(compareFn);
    }
  }

  @pending("explorer.retrieve_user")
  refresh(): Promise<void> {
    this.subscriptions.clear();

    const tasks = Configuration.explorer.subscriptions.map(v => api.retrieveUser(v));
    return Promise.all(tasks)
      .then(results => {
        results.forEach(v => {
          this.subscriptions.set(v.id, new Subscription(v));
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
    for (const key of this.subscriptions.keys()) {
      this.subscriptions.get(key).sort(fn);
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

  subscribe() {
    const options = {
      prompt: i18n("explorer.subscribe_gist")
    };
    return VSCode.showInputBox(options)
      .then(login => {
        if (login) {
          const matchs = login.trim().replace(/^https:\/\/.*github.com\//, "").match(/^(.+)\/*/);
          if (matchs.length === 0) {
            VSCode.message("error.login_name_invalid").showWarningMessage();
            return;
          }

          login = matchs.pop();

          const sub = Configuration.explorer.subscriptions;
          if (!sub.includes(login)) {
            Configuration.explorer.subscriptions = [...sub, login];
          }
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  unsubscribe(commandId: string, node: UserTreeItem) {
    VSCode.message("explorer.unsubscribe_gist_confirmation", node.label).showWarningMessage({ modal: true }, i18n("explorer.ok"))
      .then(reply => {
        if (reply) {
          const sub = Configuration.explorer.subscriptions;
          if (sub.includes(node.label)) {
            Configuration.explorer.subscriptions = sub.filter(v => v !== node.label);
          }
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }
}
