Vue.component('gist-history', {
  template: require('./history.html'),
	data() {
		return {
		};
  },
  computed: {
    history() {
      return store.state.history;
    }
  },
	mounted() {
	}
});
