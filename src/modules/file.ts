import { IFile } from "./interfaces";

export default class FileModule implements IFile {
  gistID = "";
  filename = "";
  type = "";
  language = "";
  rawURL = "";
  size = 0;

  content?: string;

  constructor(gistID?: string, data?: any) {
    this.gistID = gistID;
    this.filename = data.filename;
    this.type = data.type;
    this.language = data.language;
    this.rawURL = data.raw_url;
    this.size = data.size;
  }
}
