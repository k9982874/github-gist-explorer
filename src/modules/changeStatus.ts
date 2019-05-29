import { IChangeStatus } from ".";

export default class ChangeStatusModule implements IChangeStatus {
  total: number;
  additions: number;
  deletions: number;

  constructor(data?: any) {
    if (data) {
      this.total = data.total;
      this.additions = data.additions;
      this.deletions = data.deletions;
    }
  }
}
