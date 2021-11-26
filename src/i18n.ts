import * as util from 'util';

import i18next from 'i18next';

const options = {
  lng: 'en-US',
  debug: process.env.NODE_ENV === 'development',
  resources: {
    'en-US': {
      translation: require('../resources/i18n/en-US.json')
    },
    'zh-CN': {
      translation: require('../resources/i18n/zh-CN.json')
    }
  }
};

let translator = (key: string, ...args: any[]) => key;

if (process.env.VSCODE_NLS_CONFIG) {
  const vscNlsConfig = JSON.parse(process.env.VSCODE_NLS_CONFIG);
  if (vscNlsConfig.locale === 'zh-cn') {
    options.lng = 'zh-CN';
  }
}

i18next.init(options, function (error, t) {
  if (error) {
    console.error(error);
    return;
  }
  translator = t;
});

export default function (key: string, ...args: any[]): string {
  const s: string = translator(key);
  return util.format(s, ...args);
}
