import { IChangeStatus } from "./interfaces";

export default class ChangeStatusModule implements IChangeStatus {
  total = 0;
  additions = 0;
  deletions = 0;

  constructor(data?: any) {
    if (data) {
      this.total = data.total;
      this.additions = data.additions;
      this.deletions = data.deletions;
    }
  }
}
