<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">{{label}}</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="#">Link</b-nav-item>
          <b-nav-item href="#" disabled>Disabled</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
            <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
          </b-nav-form>

          <b-nav-item-dropdown text="Lang" right>
            <b-dropdown-item href="#">EN</b-dropdown-item>
            <b-dropdown-item href="#">ES</b-dropdown-item>
            <b-dropdown-item href="#">RU</b-dropdown-item>
            <b-dropdown-item href="#">FA</b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template slot="button-content"><em>User</em></template>
            <b-dropdown-item href="#">Profile</b-dropdown-item>
            <b-dropdown-item href="#">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { State, Getter, Action, Mutation, namespace } from 'vuex-class'

@Component
export default class App extends Vue {
  @namespace('GistModule').State
  private label!: string;

  @namespace('GistModule').Mutation('update')
  private updateGist!: (data: any) => void;

  beforeMount() {
    /* tslint:disable */
    if (typeof acquireVsCodeApi === 'function') {
      window.addEventListener('message', this.messageHandler);
      acquireVsCodeApi().postMessage({ command: 'RETRIEVE_GIST', data: {} });
    }
    /* tslint:enable */
  }

  mounted() {
    /* tslint:disable */
    if (typeof acquireVsCodeApi === 'undefined') {
      this.updateGist({
        "comments": 0,
        "commentsURL": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/comments",
        "commitsURL": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/commits",
        "createdAt": "2019-04-08T02:24:07.000Z",
        "description": "",
        "files": [{
          "filename": "cloudSettings",
          "gistID": "8e8c6eea532283f2621fc9516330e068",
          "language": null,
          "rawURL": "https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/c55d26aa14554c34c023b63c0ed9678c08480b2b/cloudSettings",
          "size": 69,
          "type": "text/plain"
        }, {
          "filename": "extensions.json",
          "gistID": "8e8c6eea532283f2621fc9516330e068",
          "language": "JSON",
          "rawURL": "https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/4d75db8c53208176a61faacacafa80bbdf598db2/extensions.json",
          "size": 5894,
          "type": "application/json"
        }, {
          "filename": "keybindings.json",
          "gistID": "8e8c6eea532283f2621fc9516330e068",
          "language": "JSON",
          "rawURL": "https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/23ca3db4bfe4526aa725f78f1a3acebd63d0f787/keybindings.json",
          "size": 8,
          "type": "application/json"
        }, {
          "filename": "keybindingsMac.json",
          "gistID": "8e8c6eea532283f2621fc9516330e068",
          "language": "JSON",
          "rawURL": "https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/23ca3db4bfe4526aa725f78f1a3acebd63d0f787/keybindingsMac.json",
          "size": 8,
          "type": "application/json"
        }, {
          "filename": "locale.json",
          "gistID": "8e8c6eea532283f2621fc9516330e068",
          "language": "JSON",
          "rawURL": "https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/fd34bdc0269e6127652e25f3939f42ecba12b7bc/locale.json",
          "size": 19,
          "type": "application/json"
        }, {
          "filename": "settings.json",
          "gistID": "8e8c6eea532283f2621fc9516330e068",
          "language": "JSON",
          "rawURL": "https://gist.githubusercontent.com/k9982874/8e8c6eea532283f2621fc9516330e068/raw/2fcfd259d5a0435760237e6d6e03967b52f56621/settings.json",
          "size": 1892,
          "type": "application/json"
        }],
        "forksURL": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/forks",
        "gitPullURL": "https://gist.github.com/8e8c6eea532283f2621fc9516330e068.git",
        "gitPushURL": "https://gist.github.com/8e8c6eea532283f2621fc9516330e068.git",
        "history": [{
          "changeStatus": {
            "additions": 13,
            "deletions": 13,
            "total": 26
          },
          "committedAt": "2019-05-22T01:35:54.000Z",
          "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/7b4fa52945904388096a4c5c56cedb649494d773",
          "user": {
            "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
            "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
            "followersURL": "https://api.github.com/users/k9982874/followers",
            "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
            "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
            "gravatarID": "",
            "htmlURL": "https://github.com/k9982874",
            "id": 3873648,
            "login": "k9982874",
            "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
            "organizationsURL": "https://api.github.com/users/k9982874/orgs",
            "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
            "reposURL": "https://api.github.com/users/k9982874/repos",
            "siteAdmin": false,
            "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
            "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/k9982874"
          },
          "version": "7b4fa52945904388096a4c5c56cedb649494d773"
        }, {
          "changeStatus": {
            "additions": 37,
            "deletions": 10,
            "total": 47
          },
          "committedAt": "2019-05-13T07:53:36.000Z",
          "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/b822164381d21e416bae7b02c8ecb354d1cceb68",
          "user": {
            "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
            "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
            "followersURL": "https://api.github.com/users/k9982874/followers",
            "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
            "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
            "gravatarID": "",
            "htmlURL": "https://github.com/k9982874",
            "id": 3873648,
            "login": "k9982874",
            "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
            "organizationsURL": "https://api.github.com/users/k9982874/orgs",
            "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
            "reposURL": "https://api.github.com/users/k9982874/repos",
            "siteAdmin": false,
            "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
            "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/k9982874"
          },
          "version": "b822164381d21e416bae7b02c8ecb354d1cceb68"
        }, {
          "changeStatus": {
            "additions": 13,
            "deletions": 31,
            "total": 44
          },
          "committedAt": "2019-05-07T02:33:02.000Z",
          "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/8cb212838d20c6dd52b757b2da68c5b7dc2ad7f3",
          "user": {
            "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
            "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
            "followersURL": "https://api.github.com/users/k9982874/followers",
            "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
            "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
            "gravatarID": "",
            "htmlURL": "https://github.com/k9982874",
            "id": 3873648,
            "login": "k9982874",
            "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
            "organizationsURL": "https://api.github.com/users/k9982874/orgs",
            "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
            "reposURL": "https://api.github.com/users/k9982874/repos",
            "siteAdmin": false,
            "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
            "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/k9982874"
          },
          "version": "8cb212838d20c6dd52b757b2da68c5b7dc2ad7f3"
        }, {
          "changeStatus": {
            "additions": 6,
            "deletions": 5,
            "total": 11
          },
          "committedAt": "2019-04-15T04:14:34.000Z",
          "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/7c4095718b91241180eb3dfe03de8c2a6fcab8b4",
          "user": {
            "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
            "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
            "followersURL": "https://api.github.com/users/k9982874/followers",
            "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
            "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
            "gravatarID": "",
            "htmlURL": "https://github.com/k9982874",
            "id": 3873648,
            "login": "k9982874",
            "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
            "organizationsURL": "https://api.github.com/users/k9982874/orgs",
            "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
            "reposURL": "https://api.github.com/users/k9982874/repos",
            "siteAdmin": false,
            "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
            "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/k9982874"
          },
          "version": "7c4095718b91241180eb3dfe03de8c2a6fcab8b4"
        }, {
          "changeStatus": {
            "additions": 3,
            "deletions": 2,
            "total": 5
          },
          "committedAt": "2019-04-08T02:43:05.000Z",
          "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/f1f4e9b1d8e57f75f849337e10b66af5eb5d06ee",
          "user": {
            "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
            "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
            "followersURL": "https://api.github.com/users/k9982874/followers",
            "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
            "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
            "gravatarID": "",
            "htmlURL": "https://github.com/k9982874",
            "id": 3873648,
            "login": "k9982874",
            "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
            "organizationsURL": "https://api.github.com/users/k9982874/orgs",
            "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
            "reposURL": "https://api.github.com/users/k9982874/repos",
            "siteAdmin": false,
            "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
            "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/k9982874"
          },
          "version": "f1f4e9b1d8e57f75f849337e10b66af5eb5d06ee"
        }, {
          "changeStatus": {
            "additions": 274,
            "deletions": 5,
            "total": 279
          },
          "committedAt": "2019-04-08T02:24:12.000Z",
          "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/c2c8d577ed8a986fff40831fbee5f80aeb7f29f5",
          "user": {
            "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
            "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
            "followersURL": "https://api.github.com/users/k9982874/followers",
            "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
            "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
            "gravatarID": "",
            "htmlURL": "https://github.com/k9982874",
            "id": 3873648,
            "login": "k9982874",
            "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
            "organizationsURL": "https://api.github.com/users/k9982874/orgs",
            "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
            "reposURL": "https://api.github.com/users/k9982874/repos",
            "siteAdmin": false,
            "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
            "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/k9982874"
          },
          "version": "c2c8d577ed8a986fff40831fbee5f80aeb7f29f5"
        }, {
          "changeStatus": {
            "additions": 7,
            "deletions": 0,
            "total": 7
          },
          "committedAt": "2019-04-08T02:24:06.000Z",
          "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068/f72204423e72f104404ca9a52cb1a750b1c03e73",
          "user": {
            "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
            "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
            "followersURL": "https://api.github.com/users/k9982874/followers",
            "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
            "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
            "gravatarID": "",
            "htmlURL": "https://github.com/k9982874",
            "id": 3873648,
            "login": "k9982874",
            "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
            "organizationsURL": "https://api.github.com/users/k9982874/orgs",
            "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
            "reposURL": "https://api.github.com/users/k9982874/repos",
            "siteAdmin": false,
            "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
            "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/k9982874"
          },
          "version": "f72204423e72f104404ca9a52cb1a750b1c03e73"
        }],
        "htmlURL": "https://gist.github.com/8e8c6eea532283f2621fc9516330e068",
        "id": "8e8c6eea532283f2621fc9516330e068",
        "label": "cloudSettings and 5 files",
        "nodeID": "MDQ6R2lzdDhlOGM2ZWVhNTMyMjgzZjI2MjFmYzk1MTYzMzBlMDY4",
        "owner": {
          "avatarURL": "https://avatars1.githubusercontent.com/u/3873648?v=4",
          "eventsURL": "https://api.github.com/users/k9982874/events{/privacy}",
          "followersURL": "https://api.github.com/users/k9982874/followers",
          "followingURL": "https://api.github.com/users/k9982874/following{/other_user}",
          "gistsURL": "https://api.github.com/users/k9982874/gists{/gist_id}",
          "gravatarID": "",
          "htmlURL": "https://github.com/k9982874",
          "id": 3873648,
          "login": "k9982874",
          "nodeID": "MDQ6VXNlcjM4NzM2NDg=",
          "organizationsURL": "https://api.github.com/users/k9982874/orgs",
          "receivedEventsURL": "https://api.github.com/users/k9982874/received_events",
          "reposURL": "https://api.github.com/users/k9982874/repos",
          "siteAdmin": false,
          "starredURL": "https://api.github.com/users/k9982874/starred{/owner}{/repo}",
          "subscriptionsURL": "https://api.github.com/users/k9982874/subscriptions",
          "type": "User",
          "url": "https://api.github.com/users/k9982874"
        },
        "public": false,
        "truncated": false,
        "updatedAt": "2019-05-22T01:35:54.000Z",
        "url": "https://api.github.com/gists/8e8c6eea532283f2621fc9516330e068",
        "user": {}
      });
    }
    /* tslint:enable */
  }

  messageHandler(event) {
    const message = event.data;
    switch (message.command) {
      case 'RETRIEVE_GIST':
        this.updateGist(message.data);
        break;
    }
  }
}
</script>
