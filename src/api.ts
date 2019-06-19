import axios, { AxiosRequestConfig } from "axios";

import waitify from "./waitify";

import * as constans from "./constans";

import { IGist, IUser, GistModule, UserModule } from "./modules";

import Configuration from "./configuration";

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

  const token = Configuration.github.token;
  if (token) {
    options.headers.authorization = `token ${token}`;
  }

  return options;
}

export function downloadFile(url: string): Promise<string> {
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

export function retrieveUser(login: string): Promise<IUser> {
  const options: AxiosRequestConfig = createRequestConfig();
  return axios.get(`${constans.GITHUB_API_URL}/users/${login}`, options)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve(new UserModule(response.data));
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

export function retrieveComment(gistID: string): Promise<any[]> {
  const options: AxiosRequestConfig = createRequestConfig();

  return axios.get(`${constans.GITHUB_API_URL}/gists/${gistID}/comments`, options)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }

      return Promise.resolve(response.data);
    });
}

export const downloadFileWaitable = waitify<string>("explorer.downloading_file", downloadFile);
export const retrieveUserWaitable = waitify("explorer.retrieve_user", retrieveUser);
export const listWaitable = waitify("explorer.listing_gist", list);
export const listStarredWaitable = waitify("explorer.listing_starred_gist", listStarred);
export const addWaitable = waitify("explorer.creating_gist", add);
export const retrieveWaitable = waitify("explorer.retrieve_gist", retrieve);
export const updateWaitable = waitify("explorer.updating_gist", update);
export const destroyWaitable = waitify("explorer.deleting_gist", destroy);
export const starWaitable = waitify("explorer.star_gist", star);
export const unstarWaitable = waitify("explorer.unstar_gist", unstar);
export const updateFileWaitable = waitify("explorer.updating_file", updateFile);
export const deleteFileWaitable = waitify("explorer.deleting_file", deleteFile);
export const renameFileWaitable = waitify("explorer.renaming_file", renameFile);
export const retrieveCommentWaitable = waitify("explorer.retrieve_comment", retrieveComment);
