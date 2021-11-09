import * as vscode from 'vscode';
import { YuqueDoc, YuqueRepo, YuqueUserDetail } from '../../@types/type';
import { DocsTreeItem } from '../common/docsTreeItem';
import { ReposTreeItem } from './ReposTreeItem';

export class ReposTreeProvider implements vscode.TreeDataProvider<ReposTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ReposTreeItem | undefined | void> = new vscode.EventEmitter<ReposTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ReposTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private repos?: YuqueRepo[]; 

    constructor(private context: vscode.ExtensionContext, private client: any, private user: YuqueUserDetail) {
        vscode.commands.registerCommand('yuque.openDoc', async (namespace, slug) => {
            let docDetail = await client.docs.get({ namespace: namespace, slug: slug, data: { raw: 1 } });
            if (docDetail.format === 'lakeboard' || docDetail.format === 'laketable' || docDetail.format === 'lakeshow' || docDetail.format === 'lakesheet' || docDetail.format === 'lakemind') {
                vscode.window.showWarningMessage(
                    `抱歉，该文档的格式为.${docDetail.format}，暂不支持查看。`
                );
            } else {
                const panel = vscode.window.createWebviewPanel(docDetail.title, docDetail.title, vscode.ViewColumn.One, {});
                panel.webview.html = docDetail.body || docDetail.body_html;
            }
        });
    }

    refresh(): void {
        return this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: ReposTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: ReposTreeItem): Promise<ReposTreeItem[] | DocsTreeItem[] | null | undefined> {
        if (element) {
            return this.getDocsTreeItems(element.namespace);
        } else {
            return this.getTopLevelTreeItems();
        }
    }

    async getTopLevelTreeItems(): Promise<ReposTreeItem[]> {
        this.repos = await this.client.repos.list({ user: this.user.id });
        let treeItems: ReposTreeItem[] = [];
        if (Array.isArray(this.repos)) {
            this.repos.forEach((item: YuqueRepo) => {
                const treeItem = new ReposTreeItem(item.name, item.namespace, item.name, vscode.TreeItemCollapsibleState.Collapsed, new vscode.ThemeIcon('repo'));
                treeItems.push(treeItem);
            });
        }
        return Promise.resolve(treeItems);
    }

    async getDocsTreeItems(namespace?: string): Promise<DocsTreeItem[]> {
        const docs = await this.client.docs.list({ namespace: namespace });
        let treeItems: DocsTreeItem[] = [];
        if (Array.isArray(docs) && docs.length > 0) {
            docs.forEach((item: YuqueDoc) => {
                const treeItem = new DocsTreeItem(item.title, item.title, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon('file-text'), {
                    title: 'OpenDoc',
                    command: 'yuque.openDoc',
                    arguments: [namespace, item.slug]
                });
                treeItems.push(treeItem);
            });
        } else {
            const treeItem = new DocsTreeItem('暂无文档', undefined, undefined, new vscode.ThemeIcon('warning'));
            treeItems.push(treeItem);
        }
        return Promise.resolve(treeItems);
    }
}