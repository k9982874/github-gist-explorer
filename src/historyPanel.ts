
import * as fs from "fs";
import * as path from "path";

import { extensions, window, Disposable, Uri, ViewColumn, WebviewPanel } from "vscode";

import * as api from "./api";
import * as constans from "./constans";

import { WebviewPanelSerializer } from "./subscriber";

export default class HistoryPanel {
  public static currentPanel?: HistoryPanel;

  public static readonly viewType = "GitHubGistHistory";

  private readonly extensionPath: string;

  private readonly panel: WebviewPanel;

  private disposables: Disposable[] = [];

  public gistID: string;

  public static show(gistID: string) {
    if (HistoryPanel.currentPanel) {
      HistoryPanel.currentPanel.panel.reveal(ViewColumn.One);
    } else {
      HistoryPanel.currentPanel = new HistoryPanel();
    }

    HistoryPanel.currentPanel.gistID = gistID;
  }

  constructor(panel?: WebviewPanel) {
    this.extensionPath = extensions.getExtension(constans.EXTENSION_ID).extensionPath;

    if (panel) {
      this.panel = panel;
    } else {
      this.panel = window.createWebviewPanel(
        "GitHubGistHistory",
        "GitHub Gist History",
        ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [Uri.file(path.join(this.extensionPath, "media"))]
        }
      );
    }

    this.panel.webview.html = this.getHtmlContent();

    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);

    this.panel.onDidChangeViewState(
      e => {
        if (this.panel.visible) {
          this.panel.webview.html = this.getHtmlContent();
        }
      },
      undefined,
      this.disposables
    );

    this.panel.webview.onDidReceiveMessage(
      message => { this.onDidReceiveMessage(message); },
      undefined,
      this.disposables
    );
  }

  onDidReceiveMessage(message) {
    switch (message.command) {
      case "RETRIEVE_GIST":
        api.retrieveWaitable(this.gistID, message.data.version)
          .then(data => {
            this.panel.webview.postMessage({
              command: "RETRIEVE_GIST",
              data
            });
          })
          .catch(error => {
            this.panel.webview.postMessage({
              command: "RETRIEVE_GIST",
              data: []
            });
          });
                break;
            case "GET_FILE":
                api.getFileWaitable(message.data.url)
          .then(data => {
            this.panel.webview.postMessage({
              command: "GET_FILE",
              data
            });
          })
          .catch(error => {
            this.panel.webview.postMessage({
              command: "GET_FILE",
              data: []
            });
          });
                break;
    }
  }

  public dispose() {
    HistoryPanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private getHtmlContent() {
    const resourcePath = path.join(this.extensionPath, "media/index.html");
    const dirPath = path.dirname(resourcePath);

    let html = fs.readFileSync(resourcePath, "utf-8");

    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, tag, link) => {
      if (link.startsWith("http://") || link.startsWith("https://") || link.startsWith("//")) {
        return tag + link + '"';
      }
      return tag + Uri.file(path.resolve(dirPath, link)).with({ scheme: "vscode-resource" }).toString() + '"';
    });
    return html;
  }
}
