import { IUser, IUserProfile } from './interfaces';

export default class UserModule implements IUser {
  id = '';
  login = '';
  nodeID?: string;
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

  constructor(data?: any) {
    if (data) {
      this.login = data.login;
      this.id = data.id;
      this.nodeID = data.node_id;
      this.avatarURL = data.avatar_url;
      this.gravatarID = data.gravatar_id;
      this.url = data.url;
      this.htmlURL = data.html_url;
      this.followersURL = data.followers_url;
      this.followingURL = data.following_url;
      this.gistsURL = data.gists_url;
      this.starredURL = data.starred_url;
      this.subscriptionsURL = data.subscriptions_url;
      this.organizationsURL = data.organizations_url;
      this.reposURL = data.repos_url;
      this.eventsURL = data.events_url;
      this.receivedEventsURL = data.received_events_url;
      this.type = data.type;
      this.siteAdmin = data.site_admin;

      this.profile = {
        name: data.name,
        company: data.company,
        blog: data.blog,
        location: data.location,
        email: data.email,
        hireable: data.hireable,
        bio: data.bio,
        publicRepos: data.publicRepos,
        publicGists: data.publicGists,
        followers: data.followers,
        following: data.following,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }
  }
}
