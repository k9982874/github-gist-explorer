import { Module, VuexModule, Mutation } from "vuex-module-decorators";

import { IFile, IHistory, IGist, IUser, HistoryStatus } from "../../../src/modules";

@Module({ namespaced: true })
export default class GistModule extends VuexModule implements IGist {
  id = "";
  label = "";
  nodeID?: string;
  url?: string;
  forksURL?: string;
  commitsURL?: string;
  gitPullURL?: string;
  gitPushURL?: string;
  htmlURL?: string;
  files: IFile[] = [];
  public?: boolean;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  comments?: string;
  user?: IUser;
  commentsURL?: string;
  owner?: IUser;
  history: IHistory[] = [];
  truncated?: boolean;

  @Mutation
  update(data: any) {
    const { version, gist } = data;

    const item = this.history.find(v => v.version === version);
    if (item !== undefined) {
      item.gist = gist;
      item.status = HistoryStatus.Done;
      return;
    }

    this.id = gist.id;
    this.label = gist.label;
    this.nodeID = gist.nodeID;
    this.url = gist.url;
    this.forksURL = gist.forksURL;
    this.commitsURL = gist.commitsURL;
    this.gitPullURL = gist.gitPullURL;
    this.gitPushURL = gist.gitPushURL;
    this.htmlURL = gist.htmlURL;
    this.files = gist.files || [];
    this.public = gist.public;
    this.createdAt = gist.createdAt;
    this.updatedAt = gist.updatedAt;
    this.description = gist.description;
    this.comments = gist.comments;
    this.user = gist.user;
    this.commentsURL = gist.commentsURL;
    this.owner = gist.owner;
    this.history = gist.history || [];
    this.truncated = gist.truncated;
  }

  @Mutation
  loading(data: any) {
    const { version } = data;

    const item = this.history.find(v => v.version === version);
    if (item !== undefined) {
      item.status = HistoryStatus.Loading;
      return;
    }
  }

}
