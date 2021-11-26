import { IGist, IFile, IUser, IHistory } from './interfaces';

import UserModule from './user';
import FileModule from './file';
import HistoryModule from './history';

export default class GistModule implements IGist {
  id = '';
  label = 'New Gist';
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

  constructor(data?: any) {
    if (data) {
      this.id = data.id;
      this.nodeID = data.node_id;
      this.url = data.url;
      this.forksURL = data.forks_url;
      this.commitsURL = data.commits_url;
      this.gitPullURL = data.git_pull_url;
      this.gitPushURL = data.git_push_url;
      this.htmlURL = data.html_url;
      this.files = Object.values(data.files).map(v => new FileModule(data.id, v));
      this.public = data.public;
      this.createdAt = data.created_at;
      this.updatedAt = data.updated_at;
      this.description = data.description || '';
      this.comments = data.comments;
      this.user = new UserModule(data.user);
      this.commentsURL = data.comments_url;
      this.owner = new UserModule(data.owner);
      this.history = data.history === undefined ? [] : data.history.map(v => new HistoryModule(v));
      this.truncated = data.truncated;

      const fileLen = Object.keys(this.files).length;

      if (this.description.length > 0) {
        this.label = this.description;

        if (fileLen === 1) {
          this.description = '1 file';
        } else if (fileLen > 0) {
          this.description = `${fileLen} files`;
        } else {
          this.description = 'Empty Gist';
        }
      } else if (fileLen === 1) {
        this.label = this.files[0].filename;
      } else if (fileLen > 0) {
        this.label = `${this.files[0].filename} and ${fileLen - 1} files`;
      } else {
        this.label = '(Empty Gist)';
      }
    }
  }
}
