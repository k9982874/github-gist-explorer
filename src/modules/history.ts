import * as moment from "moment";

import { IHistory, IUser, IChangeStatus } from ".";
import UserModule from "./user";
import ChangeStatusModule from "./changeStatus";

export default class HistoryModule implements IHistory {
  user: IUser;
  version: string;
  committedAt: string;
  changeStatus: IChangeStatus;
  url: string;

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
