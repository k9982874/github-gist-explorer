export enum HistoryStatus {
  Unknown = "UNKNOWN",
  Loading = "LOADING",
  Done = "DONE"
}

export interface IChangeStatus {
  total: number;
  additions: number;
  deletions: number;
}

export interface IFile {
  gistID: string;
  content?: string;
  filename: string;
  type: string;
  language: string;
  rawURL: string;
  size: number;
}

export interface IUser {
  login: string;
  id: number;
  nodeID: string;
  avatarURL?: string;
  gravatarID?: string;
  url?: string;
  htmlURL?: string;
  followersURL?: string;
  followingURL?: string;
  gistsURL?: string;
  starredURL?: string;
  subscriptionsURL?: string;
  organizationsURL?: string;
  reposURL?: string;
  eventsURL?: string;
  receivedEventsURL?: string;
  type?: string;
  siteAdmin?: boolean;
  profile?: IUserProfile;
}

export interface IUserProfile {
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  hireable?: string;
  bio?: string;
  publicRepos?: number;
  publicGists?: number;
  followers?: number;
  following?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHistory {
  user?: IUser;
  version: string;
  committedAt: string;
  changeStatus: IChangeStatus;
  url: string;
  status?: HistoryStatus;
  gist?: IGist;
}

export interface IGist {
  id: string;
  label: string;
  nodeID: string;
  url: string;
  forksURL: string;
  commitsURL: string;
  gitPullURL: string;
  gitPushURL: string;
  htmlURL: string;
  files: IFile[];
  public: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  comments: string;
  user?: IUser;
  commentsURL: string;
  owner?: IUser;
  history: IHistory[];
  truncated: boolean;
}
