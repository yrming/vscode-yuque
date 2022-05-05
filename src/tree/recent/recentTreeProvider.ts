import * as vscode from 'vscode'
import { RecentYuqueDoc, YuqueUserDetail } from '../../@types/type'
import YuqueSettings from '../../yuque/settings'
import { DocsTreeItem } from '../common/docsTreeItem'

export class RecentTreeProvider implements vscode.TreeDataProvider<DocsTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<DocsTreeItem | undefined | void> =
    new vscode.EventEmitter<DocsTreeItem | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<DocsTreeItem | undefined | void> =
    this._onDidChangeTreeData.event

  private docs: any | undefined

  constructor(
    private context: vscode.ExtensionContext,
    private client: any,
    private user: YuqueUserDetail,
    private recentDocsChangeEventEmitter: vscode.EventEmitter<void>
  ) {
    recentDocsChangeEventEmitter.event(() => {
      this.refresh()
    })
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: DocsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  async getChildren(element?: DocsTreeItem): Promise<DocsTreeItem[] | null | undefined> {
    const settings = YuqueSettings.instance
    this.docs = await settings.getRecentDocs()
    let treeItems: DocsTreeItem[] = []
    if (Array.isArray(this.docs) && this.docs.length > 0) {
      this.docs.forEach((item: RecentYuqueDoc) => {
        const treeItem = new DocsTreeItem(
          item.title,
          item.title,
          item.id,
          item.namespace,
          vscode.TreeItemCollapsibleState.None,
          new vscode.ThemeIcon('file-text'),
          {
            title: 'OpenDoc',
            command: 'yuque.openDoc',
            arguments: [this.client, item.namespace, item]
          }
        )
        treeItems.push(treeItem)
      })
    } else {
      const treeItem = new DocsTreeItem(
        '暂无数据',
        undefined,
        undefined,
        undefined,
        undefined,
        new vscode.ThemeIcon('warning')
      )
      treeItems.push(treeItem)
    }
    return Promise.resolve(treeItems)
  }
}
