import { IGist, IHistory, IUser, HistoryStatus } from './interfaces';

import UserModule from './user';
import ChangeStatusModule from './changeStatus';

export default class HistoryModule implements IHistory {
  user?: IUser;
  version = '';
  committedAt = '';
  changeStatus = {
    total: 0,
    additions: 0,
    deletions: 0
  };
  url = '';
  status: HistoryStatus = HistoryStatus.Unknown;
  gist?: IGist;

  constructor(data?: any) {

    if (data) {
      this.user = new UserModule(data.user);
      this.version = data.version;
      this.committedAt = data.committed_at;
      this.changeStatus = new ChangeStatusModule(data.change_status);
      this.url = data.url;
    } else {
      this.user = new UserModule();
    }
  }
}
