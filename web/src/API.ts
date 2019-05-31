import Vue from "vue";

const gistData = {
	"command": "RETRIEVE_GIST",
	"data": {
		"gist": {
			"comments": 0,
			"commentsURL": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/comments",
			"commitsURL": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/commits",
			"createdAt": "2019-04-15T02:10:17Z",
			"description": "",
			"files": [{
				"filename": "archlinux-server-optimization.sh",
				"gistID": "d0dc69f1cb78a2227684e1e2ae38454a",
				"language": "Shell",
				"rawURL": "https://gist.githubusercontent.com/k9982874/d0dc69f1cb78a2227684e1e2ae38454a/raw/bf31769170229d79ef874f9180a46af920463611/archlinux-server-optimization.sh",
				"size": 2353,
				"type": "application/x-sh"
			}],
			"forksURL": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/forks",
			"gitPullURL": "https://gist.github.com/d0dc69f1cb78a2227684e1e2ae38454a.git",
			"gitPushURL": "https://gist.github.com/d0dc69f1cb78a2227684e1e2ae38454a.git",
			"history": [{
				"changeStatus": {
					"additions": 0,
					"deletions": 2,
					"total": 2
				},
				"committedAt": "2019-05-10T01:57:26Z",
				"status": "UNKNOWN",
				"url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/524e1b395a39a8159b7b2c6ff89397ce05c0643e",
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
				"version": "524e1b395a39a8159b7b2c6ff89397ce05c0643e"
			}, {
				"changeStatus": {
					"additions": 2,
					"deletions": 0,
					"total": 2
				},
				"committedAt": "2019-05-10T01:57:08Z",
				"status": "UNKNOWN",
				"url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/d374e6f758429a160de547ba479ea25f819c8011",
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
				"version": "d374e6f758429a160de547ba479ea25f819c8011"
			}, {
				"changeStatus": {
					"additions": 1,
					"deletions": 5,
					"total": 6
				},
				"committedAt": "2019-04-30T04:00:38Z",
				"status": "UNKNOWN",
				"url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/5808b26a37d0ce4bc15c4afa84982b3e73de452d",
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
				"version": "5808b26a37d0ce4bc15c4afa84982b3e73de452d"
			}, {
				"changeStatus": {
					"additions": 2,
					"deletions": 0,
					"total": 2
				},
				"committedAt": "2019-04-15T02:14:09Z",
				"status": "UNKNOWN",
				"url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/287bf06a0e2f6ba2e9984fd8ad9b6d33d7864e35",
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
				"version": "287bf06a0e2f6ba2e9984fd8ad9b6d33d7864e35"
			}, {
				"changeStatus": {
					"additions": 5,
					"deletions": 5,
					"total": 10
				},
				"committedAt": "2019-04-15T02:12:04Z",
				"status": "UNKNOWN",
				"url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/27a78740d76496b21083bf2f25e4584cec5bee55",
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
				"version": "27a78740d76496b21083bf2f25e4584cec5bee55"
			}, {
				"changeStatus": {
					"additions": 83,
					"deletions": 0,
					"total": 83
				},
				"committedAt": "2019-04-15T02:10:17Z",
				"status": "UNKNOWN",
				"url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/6688cba7d7d7a420fa3f17e609183caa4629c709",
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
				"version": "6688cba7d7d7a420fa3f17e609183caa4629c709"
			}],
			"htmlURL": "https://gist.github.com/d0dc69f1cb78a2227684e1e2ae38454a",
			"id": "d0dc69f1cb78a2227684e1e2ae38454a",
			"label": "archlinux-server-optimization.sh",
			"nodeID": "MDQ6R2lzdGQwZGM2OWYxY2I3OGEyMjI3Njg0ZTFlMmFlMzg0NTRh",
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
			"public": true,
			"truncated": false,
			"updatedAt": "2019-05-10T01:57:27Z",
			"url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a",
			"user": {
				"avatarURL": "",
				"eventsURL": "",
				"followersURL": "",
				"followingURL": "",
				"gistsURL": "",
				"gravatarID": "",
				"htmlURL": "",
				"id": 0,
				"login": "",
				"nodeID": "",
				"organizationsURL": "",
				"receivedEventsURL": "",
				"reposURL": "",
				"siteAdmin": false,
				"starredURL": "",
				"subscriptionsURL": "",
				"type": "",
				"url": ""
			}
		},
		"gistID": "d0dc69f1cb78a2227684e1e2ae38454a"
	}
};

const gistHistoryData = {
  "command": "RETRIEVE_GIST",
  "data": {
    "gist": {
      "comments": 0,
      "commentsURL": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/comments",
      "commitsURL": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/commits",
      "createdAt": "2019-04-15T02:10:17Z",
      "description": "",
      "files": [{
        "filename": "archlinux-server-optimization.sh",
        "gistID": "d0dc69f1cb78a2227684e1e2ae38454a",
        "language": "Shell",
        "rawURL": "https://gist.githubusercontent.com/k9982874/d0dc69f1cb78a2227684e1e2ae38454a/raw/6f3484a29b3b11d87cfd06b9d23a3fe7a1f85cba/archlinux-server-optimization.sh",
        "size": 2464,
        "type": "application/x-sh"
      }],
      "forksURL": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/forks",
      "gitPullURL": "https://gist.github.com/d0dc69f1cb78a2227684e1e2ae38454a.git",
      "gitPushURL": "https://gist.github.com/d0dc69f1cb78a2227684e1e2ae38454a.git",
      "history": [{
        "changeStatus": {
          "additions": 2,
          "deletions": 0,
          "total": 2
        },
        "committedAt": "2019-04-15T02:14:09Z",
        "status": "UNKNOWN",
        "url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/287bf06a0e2f6ba2e9984fd8ad9b6d33d7864e35",
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
        "version": "287bf06a0e2f6ba2e9984fd8ad9b6d33d7864e35"
      }, {
        "changeStatus": {
          "additions": 5,
          "deletions": 5,
          "total": 10
        },
        "committedAt": "2019-04-15T02:12:04Z",
        "status": "UNKNOWN",
        "url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/27a78740d76496b21083bf2f25e4584cec5bee55",
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
        "version": "27a78740d76496b21083bf2f25e4584cec5bee55"
      }, {
        "changeStatus": {
          "additions": 83,
          "deletions": 0,
          "total": 83
        },
        "committedAt": "2019-04-15T02:10:17Z",
        "status": "UNKNOWN",
        "url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/6688cba7d7d7a420fa3f17e609183caa4629c709",
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
        "version": "6688cba7d7d7a420fa3f17e609183caa4629c709"
      }],
      "htmlURL": "https://gist.github.com/d0dc69f1cb78a2227684e1e2ae38454a",
      "id": "d0dc69f1cb78a2227684e1e2ae38454a",
      "label": "archlinux-server-optimization.sh",
      "nodeID": "MDQ6R2lzdGQwZGM2OWYxY2I3OGEyMjI3Njg0ZTFlMmFlMzg0NTRh",
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
      "public": true,
      "truncated": false,
      "updatedAt": "2019-05-10T01:57:27Z",
      "url": "https://api.github.com/gists/d0dc69f1cb78a2227684e1e2ae38454a/287bf06a0e2f6ba2e9984fd8ad9b6d33d7864e35",
      "user": {
        "avatarURL": "",
        "eventsURL": "",
        "followersURL": "",
        "followingURL": "",
        "gistsURL": "",
        "gravatarID": "",
        "htmlURL": "",
        "id": 0,
        "login": "",
        "nodeID": "",
        "organizationsURL": "",
        "receivedEventsURL": "",
        "reposURL": "",
        "siteAdmin": false,
        "starredURL": "",
        "subscriptionsURL": "",
        "type": "",
        "url": ""
      }
    },
    "gistID": "d0dc69f1cb78a2227684e1e2ae38454a",
    "version": "287bf06a0e2f6ba2e9984fd8ad9b6d33d7864e35"
  }
};

function messageHandle(store, event) {
  const message = event.data;
  switch (message.command) {
    case "RETRIEVE_GIST":
      console.log(JSON.stringify(message));
      if (message.data.version === undefined) {
        this.setState(message.data);
      }
      store.commit("GistModule/update", message.data);
      break;
  }
}

export default function (Vue: typeof Vue, options?: any): void {
  const { store } = options;

  if (typeof acquireVsCodeApi === "undefined") {
    let state: any = { ...gistData.data };

    Vue.prototype.$api = {
      getState(): any {
        return state;
      },

      setState(data: any) {
        state = data;
      },

      postMessage (message: any): any {
        if (message.command === "RETRIEVE_GIST") {
          store.commit("GistModule/loading", message.data);

          if (message.data.version === undefined) {
            window.postMessage(gistData);
          } else {
            gistHistoryData.data.version = message.data.version;
            window.postMessage(gistHistoryData);
          }
        }
      }
    }
  } else {
    const api = acquireVsCodeApi();
    Vue.prototype.$api = {
      getState: api.getState,

      setState: api.setState,

      postMessage(message: any): any {
        if (message.command === "RETRIEVE_GIST") {
          store.commit("GistModule/loading", message.data);
        }
        return api.postMessage(message);
      }
    }
  }

  window.addEventListener("message", messageHandle.bind(Vue.prototype.$api, store));
}
