import * as moment from 'moment';

import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { IFile, IHistory, IGist, IUser } from '../../../src/modules';

@Module({ namespaced: true })
export default class GistModule extends VuexModule implements IGist {
	id: string = '';
	label: string = '';
	nodeID: string = '';
	url: string = '';
	forksURL: string = '';
	commitsURL: string = '';
	gitPullURL: string = '';
	gitPushURL: string = '';
	htmlURL: string = '';
	files: Array<IFile> = [];
	public: string = '';
	createdAt: moment.Moment = null;
	updatedAt: moment.Moment = null;
	description: string = '';
	comments: string = '';
	user: IUser = null;
	commentsURL: string = '';
	owner: IUser = null;
	history: Array<IHistory> = [];
	truncated: boolean;

  @Mutation
  update(data) {
    this.id = data.id;
    this.label = data.label;
    this.nodeID = data.nodeID;
    this.url = data.url;
    this.forksURL = data.forksURL;
    this.commitsURL = data.commitsURL;
    this.gitPullURL = data.gitPullURL;
    this.gitPushURL = data.gitPushURL;
    this.htmlURL = data.htmlURL;
    this.files = data.files.map(v => {
      return {...v, ...{ committedAt: moment(v.committedAt) }};
    });
    this.public = data.public;
    this.createdAt = moment(data.createdAt);
    this.updatedAt = moment(data.updatedAt);
    this.description = data.description;
    this.comments = data.comments;
    this.user = data.user;
    this.commentsURL = data.commentsURL;
    this.owner = data.owner;
    this.history = data.history;
    this.truncated = data.truncated;
  }
}
