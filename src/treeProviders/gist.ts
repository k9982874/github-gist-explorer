import { Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";

import * as api from "../api";
import * as VSCode from "../vscode";

import Configuration, { validate } from "../configuration";

import { pending } from "../waitify";

import { IGist } from "../modules";
import { ITreeProvider, TreeSortBy, GistTreeItem, FileTreeItem, compareFn } from "./common";

type Node = GistTreeItem | FileTreeItem;

export class GistTreeProvider implements ITreeProvider<IGist>, TreeDataProvider<Node> {
  private readonly onDidChangeTreeDataEmitter: EventEmitter<Node | undefined> = new EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData: Event<Node | undefined> = this.onDidChangeTreeDataEmitter.event;

  private starredItems: IGist[] = new Array();
  private unstarredItems: IGist[] = new Array();

  get items(): IGist[] {
    return [...this.starredItems, ...this.unstarredItems];
  }

  getTreeItem(element: Node): TreeItem {
    return element;
  }

  getChildren(element?: Node): Node[] {
    if (element) {
      if (element.contextValue.startsWith("Gist")) {
        return (element as GistTreeItem).metadata.files.map(f => new FileTreeItem(f));
      }
      return [];
    } else {
      const starredItems = this.starredItems.map(value => new GistTreeItem(value, true));
      const unstarredItems = this.unstarredItems.map(value => new GistTreeItem(value));

      return [...starredItems, ...unstarredItems];
    }
  }

  @validate
  @pending("explorer.listing_gist")
  refresh(): Promise<void> {
    this.starredItems = [];
    this.unstarredItems = [];

    return Promise.all([api.list(Configuration.github.username), api.listStarred()])
      .then(([all, starred]) => {
        this.starredItems = starred;
        this.unstarredItems = all.filter(a => starred.findIndex(b => a.id === b.id) === -1);

        this.sort();
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  sort(sortBy?: string, ascending?: boolean) {
    if (sortBy === undefined) {
      sortBy = Configuration.explorer.gistSortBy;
    } else {
      Configuration.explorer.gistSortBy = sortBy;
    }

    if (ascending === undefined) {
      ascending = Configuration.explorer.gistAscending;
    } else {
      Configuration.explorer.gistAscending = ascending;
    }

    VSCode.executeCommand("setContext", "GistAscending", ascending);

    const fn = compareFn(sortBy, ascending);

    this.starredItems = this.starredItems.sort(fn);
    this.unstarredItems = this.unstarredItems.sort(fn);

    this.onDidChangeTreeDataEmitter.fire();
  }

  sortByLabel() {
    const sortBy: string = Configuration.explorer.gistSortBy;
    if (sortBy !== TreeSortBy.Label) {
      this.sort(TreeSortBy.Label);
    }
  }

  sortByLastUpdated() {
    const sortBy: string = Configuration.explorer.gistSortBy;
    if (sortBy !== TreeSortBy.LastUpdated) {
      this.sort(TreeSortBy.LastUpdated);
    }
  }

  sortByCreated() {
    const sortBy: string = Configuration.explorer.gistSortBy;
    if (sortBy !== TreeSortBy.Created) {
      this.sort(TreeSortBy.Created);
    }
  }

  ascending() {
    const sortBy: string = Configuration.explorer.gistSortBy;
    this.sort(sortBy, false);
  }

  descending() {
    const sortBy: string = Configuration.explorer.gistSortBy;
    this.sort(sortBy, true);
  }
}
