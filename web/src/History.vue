<template>
  <div>
    <b-card v-for="item in history" :key="item.version" no-body class="history my-4">
      <b-card-header header-tag="header" class="px-4" role="tab">
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
                  <h4>
                    <b-link :href="item.user.htmlURL">{{item.user.login}}</b-link> revised this gist {{duration(item)}} ago.
                  </h4>
                </b-col>
              </b-row>
              <b-row align-v="center">
                <b-col>
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="code-branch" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="code-branch">
                    <path fill="#6c757d" d="M384 144c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 36.4 24.3 67.1 57.5 76.8-.6 16.1-4.2 28.5-11 36.9-15.4 19.2-49.3 22.4-85.2 25.7-28.2 2.6-57.4 5.4-81.3 16.9v-144c32.5-10.2 56-40.5 56-76.3 0-44.2-35.8-80-80-80S0 35.8 0 80c0 35.8 23.5 66.1 56 76.3v199.3C23.5 365.9 0 396.2 0 432c0 44.2 35.8 80 80 80s80-35.8 80-80c0-34-21.2-63.1-51.2-74.6 3.1-5.2 7.8-9.8 14.9-13.4 16.2-8.2 40.4-10.4 66.1-12.8 42.2-3.9 90-8.4 118.2-43.4 14-17.4 21.1-39.8 21.6-67.9 31.6-10.8 54.4-40.7 54.4-75.9zM80 64c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm0 384c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm224-320c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16z" class=""></path>
                  </svg>
                  <span class="text-muted">
                    <strong>{{item.changeStatus.additions}}</strong> addition{{item.changeStatus.additions > 1 ? "s" : ""}} and 
                    <strong>{{item.changeStatus.deletions}}</strong> deletion{{item.changeStatus.deletions > 1 ? "s" : ""}}.
                  </span>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-container>
      </b-card-header>
      <b-collapse :id="item.version" @shown="onItemOpened(item)" @hidden="onItemClosed(item)">
        <b-card-body class="d-flex justify-content-center">
          <!--b-alert v-if="getError(item)" show variant="danger">{{getError(item).message}}</b-alert-->
          <b-spinner v-if="item.status === 'LOADING'" type="grow"></b-spinner>
          <div v-else-if="item.status === 'DONE'" class="d-flex flex-wrap flex-grow-1">
            <div v-for="file in item.gist.files" :key="file.filename" class="d-flex px-4">
              <div md="auto">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1135" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16">
                  <path d="M745.2 773.1H428.1c-14.9 0-28 13.1-28 28v56c0 14.9 13.1 28 28 28h317.1c14.9 0 28-13.1 28-28v-56c-0.1-14.9-13.1-28-28-28z m186.5-186.5H428.1c-14.9 0-28 13.1-28 28v56c0 14.9 13.1 28 28 28h503.6c14.9 0 28-13.1 28-28v-56c0-14.9-13.1-28-28-28z m-634.2 0H92.3c-14.9 0-28 13.1-28 28v242.5c0 14.9 13.1 28 28 28h205.2c14.9 0 28-13.1 28-28V614.6c0-14.9-13.1-28-28-28z m130.6-149.2h317.1c14.9 0 28-13.1 28-28v-56c0-14.9-13.1-28-28-28H428.1c-14.9 0-28 13.1-28 28v56c0 14.9 13 28 28 28zM931.7 139H428.1c-14.9 0-28 13.1-28 28v56c0 14.9 13.1 28 28 28h503.6c14.9 0 28-13.1 28-28v-56c0-15-13.1-28-28-28z m-634.2 0H92.3c-14.9 0-28 13.1-28 28v242.5c0 14.9 13.1 28 28 28h205.2c14.9 0 28-13.1 28-28V166.9c0-14.9-13.1-27.9-28-27.9z" p-id="1136"></path>
                </svg>
              </div>
              <div class="mx-1">
                <b-link href="#" @click="onFileSelected(item.version, file)">{{file.filename}}</b-link>
              </div>
            </div>
          </div>
        </b-card-body>
      </b-collapse>
      <b-card-footer>
        <small class="text-muted">Commited At: {{committedAt(item)}}</small>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script lang="ts">
import * as moment from "moment";

import axios from "axios";

import { Vue, Component, Prop } from "vue-property-decorator";

import { State, Getter, Action, Mutation, namespace } from "vuex-class"

import { IFile, IGist, IHistory } from "../../src/modules";

import API from "./API"

import "./History.styl"

@Component
export default class History extends Vue {
  @namespace("GistModule").State
  private id: string;

  @namespace("GistModule").State
  private files: Array<IFile>;

  @namespace("GistModule").State
  private history: Array<IHistory>;

  duration(item) {
    const n = moment().diff(item.committedAt);
    const duration = moment.duration(n);
    return duration.humanize();
  }

  committedAt(item) {
    return moment(item.committedAt).format("dddd MMMM Do YYYY hA");
  }

  onItemOpened(item: IHistory) {
    if (item.gist) {
      return;
    }

    this.$api.postMessage({ command: "RETRIEVE_GIST", data: { gistID: this.id, version: item.version } });
  }

  onItemClosed(item: IHistory) {
  }

  onFileSelected(version: string, file: IFile) {
    const lastestFile = this.files.find(v => v.filename === file.filename);
    if (!lastestFile) {
      return;
    }

    const data = {
      version,
      filename: file.filename,
      lastest: lastestFile.rawURL,
      history: file.rawURL
    };

    this.$api.postMessage({ command: "FILE_SELECTED", data });
  }
}
</script>
