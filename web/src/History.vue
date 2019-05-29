<template>
  <div>
    <b-card no-body class="mb-1" v-for="item in history" :key="item.version">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-container v-b-toggle="item.version">
          <b-row align-v="center">
            <b-col md="auto">
              <b-link :href="item.user.htmlURL">
                <b-img class="user-image rounded-circle" :src="item.user.avatarURL" :alt="item.user.login"></b-img>
              </b-link>
            </b-col>
            <b-col>
              <b-row>
                <b-col>
                  <h3>
                    <b-link :href="item.user.htmlURL">{{item.user.login}}</b-link> revised this gist {{duration(item)}} ago.
                  </h3>
                </b-col>
              </b-row>
              <b-row align-v="center">
                <b-col>
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="code-branch" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="code-branch">
                    <path fill="#6c757d" d="M384 144c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 36.4 24.3 67.1 57.5 76.8-.6 16.1-4.2 28.5-11 36.9-15.4 19.2-49.3 22.4-85.2 25.7-28.2 2.6-57.4 5.4-81.3 16.9v-144c32.5-10.2 56-40.5 56-76.3 0-44.2-35.8-80-80-80S0 35.8 0 80c0 35.8 23.5 66.1 56 76.3v199.3C23.5 365.9 0 396.2 0 432c0 44.2 35.8 80 80 80s80-35.8 80-80c0-34-21.2-63.1-51.2-74.6 3.1-5.2 7.8-9.8 14.9-13.4 16.2-8.2 40.4-10.4 66.1-12.8 42.2-3.9 90-8.4 118.2-43.4 14-17.4 21.1-39.8 21.6-67.9 31.6-10.8 54.4-40.7 54.4-75.9zM80 64c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm0 384c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm224-320c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16z" class=""></path>
                  </svg>
                  <span class="text-secondary">
                    <strong>{{item.changeStatus.additions}}</strong> addition{{item.changeStatus.additions > 1 ? 's' : ''}} and 
                    <strong>{{item.changeStatus.deletions}}</strong> deletion{{item.changeStatus.deletions > 1 ? 's' : ''}}.
                  </span>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-container>
      </b-card-header>
      <b-collapse :id="item.version" v-on:shown="onItemOpened(item)" v-on:hidden="onItemClosed(item)">
        <b-card-body>
          <b-alert v-if="getError(item)" show variant="danger">{{getError(item).message}}</b-alert>
          <template v-if="hasVersion(item)">
            <b-spinner v-if="getVersion(item) === null" type="grow"></b-spinner>
            <b-container v-else>
              <b-row align-v="center" v-for="file in getVersion(item).files" :key="file.filename">
                <b-col>
                  <b-link href="#">{{file.filename}}</b-link>
                </b-col>
              </b-row>
            </b-container>
          </template>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script lang="ts">
import * as moment from 'moment';

import axios from 'axios';

import { Vue, Component, Watch } from 'vue-property-decorator';

import { State, Getter, Action, Mutation, namespace } from 'vuex-class'

import { IGist, IHistory,  } from '../../src/modules';

import './History.styl'

interface IHistoryItem {
  version: string;
  gist?: IGist;
  error?: Error;
}

@Component
export default class History extends Vue {
  @namespace('GistModule').State('history')
  private history: Array<IHistory>;

  private versions: Array<IHistoryItem> = [];
  /*
  private versions: Map<string, IGist> = new Map();
  private errors: Map<string, Error> = new Map();
  */

  duration(item) {
    const n = moment().diff(item.committedAt);
    const duration = moment.duration(n);
    return duration.humanize();
  }

  getError(item): Error {
    const i = this.versions.find(v => v.version === item.version);
    if (i) {
      return i.error;
    }
    return null;
  }

  hasVersion(item: IHistory): boolean {
    return this.versions.find(v => v.version === item.version) !== undefined;
  }

  getVersion(item: IHistory): IGist {
    const i = this.versions.find(v => v.version === item.version);
    if (i) {
      return i.gist;
    }
    return null;
  }

  onItemOpened(item: IHistory) {
    if (this.hasVersion(item)) {
      return;
    }

    this.versions.push({ version: item.version, gist: null });

    axios.get(item.url)
      .then(response => {
        this.versions.find(v => v.version === item.version).gist = response.data;
      })
      .catch(error => {
        this.versions.find(v => v.version === item.version).error = error;
      });
  }

  onItemClosed(item: IHistory) {
    const pos = this.versions.findIndex(v => v.version === item.version);
    if (pos !== -1) {
      this.versions.splice(pos, 1);
    }
  }
}
</script>
