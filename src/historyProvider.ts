import i18n from "./i18n";

import { commands, extensions, window, Uri, ViewColumn, WebviewPanel } from "vscode";

import { IWebviewProvider, IWebviewWrapper, WebviewProvider } from "vscode-extension-decorator";

import * as fs from "fs";
import * as path from "path";

import * as api from "./api";
import * as constans from "./constans";
import * as VSCode from "./vscode";

import { IGist } from "./modules";

@WebviewProvider
export default class HistoryViewProvider implements IWebviewProvider {
  wrapper?: IWebviewWrapper;
  wrapperClass?: Object;

  extensionPath: string;

  static show(gist: IGist) {
    (HistoryViewProvider as any).reveal(ViewColumn.One, gist.id);
  }

  constructor(state?: any) {
    this.extensionPath = extensions.getExtension(constans.EXTENSION_ID).extensionPath;
  }

  createWebviewPanel(): WebviewPanel {
    return window.createWebviewPanel(
      "GitHubGistHistory",
      "GitHub Gist History",
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [Uri.file(path.join(this.extensionPath, "media"))]
      }
    );
  }

  didReceiveMessageHandle(message: any) {
    switch (message.command) {
      case "RETRIEVE_GIST":
        this.retrieveGist(message.data.gistID, message.data.version);
        break;
      case "FILE_SELECTED":
        this.fileSelected(message.data);
        break;
    }
  }

  getHtmlContent(gistID: string): string {
    const resourcePath = path.join(this.extensionPath, "media/index.html");
    const dirPath = path.dirname(resourcePath);

    let html = fs.readFileSync(resourcePath, "utf-8");

    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, tag, link) => {
      if (link.startsWith("http://") || link.startsWith("https://") || link.startsWith("//")) {
        return tag + link + '"';
      }
      return tag + Uri.file(path.resolve(dirPath, link)).with({ scheme: "vscode-resource" }).toString() + '"';
    });

    if (gistID) {
      html = html.replace(/(data-id="")/g, `data-id="${gistID}"`);
    }

    return html;
  }

  retrieveGist(gistID: string, version?: string) {
    api.retrieveWaitable(gistID, version)
      .then(data => {
        this.wrapper.postMessage({
          command: "RETRIEVE_GIST",
          data: {
            gistID,
            version,
            gist: data
          }
        });
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }

  fileSelected(data: any) {
    const view = i18n("explorer.view_file");
    const compare = i18n("explorer.compare_file");

    VSCode.showQuickPick([view, compare])
      .then(action => {
        const version = data.version.substr(-7);

        if (action) {
          if (action === view) {
            const uri = Uri.parse(`GitHubGistHistoryContent:${version} - ${data.filename}?${data.history}`);
            VSCode.showTextDocument(uri, { preview: true });
          } else if (action === compare) {
            const latest = Uri.parse(`GitHubGistHistoryContent:${data.filename}?${data.lastest}`);
            const history = Uri.parse(`GitHubGistHistoryContent:${data.filename}?${data.history}`);

            const title = `${data.filename}: Lastest \u2194 ${version}`;

            commands.executeCommand("vscode.diff", latest, history, title, { preview: true });
          }
        }
      })
      .catch(error => {
        VSCode.showErrorMessage(error.message);
      });
  }
}
