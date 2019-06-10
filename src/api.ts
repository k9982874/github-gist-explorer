import axios, { AxiosRequestConfig } from "axios";

import waitfiy from "./waitfiy";

import * as constans from "./constans";

import { IGist } from "./modules";
import GistModule from "./modules/gist";

import i18n from "./i18n";

import ConfigurationManager from "./configuration";

export interface INewFile {
  filename: string;
  content: string | Buffer;
}

function createRequestConfig(): AxiosRequestConfig {
  const options: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  const token = ConfigurationManager.github.token;
  if (token) {
    options.headers.authorization = `token ${token}`;
  }

  return options;
}

export function getFile(url: string): Promise<any> {
  const options: AxiosRequestConfig = createRequestConfig();
  options.transformResponse = [
    (data, headers) => data
  ];

  return axios.get(url, options)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }

      return response.data;
    });
}

export function list(username: string): Promise<IGist[]> {
  const options: AxiosRequestConfig = createRequestConfig();

  const p = function (page: number, results: IGist[]) {
    return axios.get(`${constans.GITHUB_API_URL}/users/${username}/gists?page=${page}`, options)
      .then(response => {
        if (response.status !== 200) {
          return Promise.resolve([]);
        }

        const data = response.data.map(value => new GistModule(value));
        return Promise.resolve(data);
      })
      .then(data => {
        if (data.length === 0) {
          return Promise.resolve(results);
        }
        return p(page + 1, [...results, ...data]);
      })
      .catch(error => {
        return Promise.resolve([]);
      });
  };

  return p(1, []);
}

export function listStarred(): Promise<IGist[]> {
  const options: AxiosRequestConfig = createRequestConfig();

  const p = function (page: number, results: IGist[]) {
    return axios.get(`${constans.GITHUB_API_URL}/gists/starred?page=${page}`, options)
      .then(response => {
        if (response.status !== 200) {
          return Promise.resolve([]);
        }

        const data = response.data.map(value => new GistModule(value));
        return Promise.resolve(data);
      })
      .then(data => {
        if (data.length === 0) {
          return Promise.resolve(results);
        }
        return p(page + 1, [...results, ...data]);
      })
      .catch(error => {
        return Promise.resolve([]);
      });
  };

  return p(1, []);
}

export function add(type: string, description: string, files?: INewFile[]): Promise<IGist> {
  const options: AxiosRequestConfig = createRequestConfig();

  const data = {
    description,
    public: type === constans.GistType.Public,
    files: {}
  };

  if (files) {
    data.files = files.reduce((pv, cv) => {
      pv[cv.filename] = {
        content: cv.content.toString()
      };
      return pv;
    }, {});
  } else {
    const file = constans.CLASSIC_MOVIE_QUOTES[Math.floor(Math.random() * 100)];
    data.files = {
      [file.name]: {
        content: file.words
      }
    };
  }

  return axios.post(`${constans.GITHUB_API_URL}/gists`, data, options)
    .then(response => {
      if ((response.status !== 200) && (response.status !== 201)) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve(new GistModule(response.data));
    });
}

export function retrieve(gistID: string, version?: string): Promise<IGist> {
  const options: AxiosRequestConfig = createRequestConfig();

  let url = `${constans.GITHUB_API_URL}/gists/${gistID}`;
  if (version) {
    url = url + `/${version}`;
  }

  return axios.get(url, options)
    .then(response => {
      if ((response.status !== 200) && (response.status !== 201)) {
        return Promise.reject(new Error(response.statusText));
      }

      const data = new GistModule(response.data);
      return Promise.resolve(data);
    });
}

export function update(gistID: string, description: string, files?: INewFile[]): Promise<IGist> {
  const options: AxiosRequestConfig = createRequestConfig();

  const data = {
    gist_id: gistID,
    description,
    files: undefined
  };

  if (files) {
    data.files = files.reduce((pv, cv) => {
      pv[cv.filename] = {
        content: cv.content.toString()
      };
      return pv;
    }, {});
  }

  return axios.patch(`${constans.GITHUB_API_URL}/gists/${gistID}`, data, options)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve(new GistModule(response.data));
    });
}

export function destroy(gistID: string): Promise<void> {
  const options: AxiosRequestConfig = createRequestConfig();

  return axios.delete(`${constans.GITHUB_API_URL}/gists/${gistID}`, options)
    .then(response => {
      if ((response.status !== 200) && (response.status !== 204)) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve();
    });
}

export function star(gistID: string): Promise<void> {
  const options: AxiosRequestConfig = createRequestConfig();

  return axios.put(`${constans.GITHUB_API_URL}/gists/${gistID}/star`, undefined, options)
    .then(response => {
      if ((response.status !== 200) && (response.status !== 204)) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve();
    });
}

export function unstar(gistID: string): Promise<void> {
  const options: AxiosRequestConfig = createRequestConfig();

  return axios.delete(`${constans.GITHUB_API_URL}/gists/${gistID}/star`, options)
    .then(response => {
      if ((response.status !== 200) && (response.status !== 204)) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve();
    });
}

export function updateFile(gistID: string, filename: string, content: string | Buffer): Promise<IGist> {
  return update(gistID, undefined, [{ filename, content }]);
}

export function deleteFile(gistID: string, filename: string): Promise<void> {
  const options: AxiosRequestConfig = createRequestConfig();

  const data = {
    files: {
      [filename]: null
    },
    gist_id: gistID
  };

  return axios.patch(`${constans.GITHUB_API_URL}/gists/${gistID}`, data, options)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve();
    });
}

export function renameFile(gistID: string, filename: string, newFilename: string): Promise<string> {
  const options: AxiosRequestConfig = createRequestConfig();

  const data = {
    files: {
      [filename]: {
        filename: newFilename
      }
    },
    gist_id: gistID
  };

  return axios.patch(`${constans.GITHUB_API_URL}/gists/${gistID}`, data, options)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve(newFilename);
    });
}

export const getFileWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.downloading_file")}`, getFile);
export const listWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.listing_gist")}`, list);
export const listStarredWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.listing_starred_gist")}`, listStarred);
export const addWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.creating_gist")}`, add);
export const retrieveWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.retrieve_gist")}`, retrieve);
export const updateWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.updating_gist")}`, update);
export const destroyWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.deleting_gist")}`, destroy);
export const starWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.star_gist")}`, star);
export const unstarWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.unstar_gist")}`, unstar);
export const updateFileWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.updating_file")}`, updateFile);
export const deleteFileWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.deleting_file")}`, deleteFile);
export const renameFileWaitable = waitfiy(`${constans.EXTENSION_NAME}: ${i18n("explorer.renaming_file")}`, renameFile);
