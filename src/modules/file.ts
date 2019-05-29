import { IFile } from ".";

export default class FileModule implements IFile {
  gistID: string;
  filename: string;
  type: string;
  language: string;
  rawURL: string;
  size: number;

  constructor(gistID?: string, data?: any) {
    this.gistID = gistID;
    this.filename = data.filename;
    this.type = data.type;
    this.language = data.language;
    this.rawURL = data.raw_url;
    this.size = data.size;
  }
}
