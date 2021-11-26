import GistModule from "./GistModule";

const storeOptions = {
  state: {
    id: ""
  },
  mutations: {
    update(state, id) {
      state.id = id;
    }
  },
  modules: {
    GistModule
  }
};

export default function (additionOptions?: Object): Object {
  if (additionOptions) {
    return {...storeOptions, ...{ state: { ...additionOptions } } };
  } else {
    return storeOptions;
  }
}
