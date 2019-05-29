import History from './History.vue';

export default [{
  name: 'History',
  path: '/history',
  component: History
}, {
  path: '*',
  redirect: '/history'
}];
