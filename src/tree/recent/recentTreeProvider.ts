import * as vscode from 'vscode';
import { YuqueUserDetail } from '../../@types/type';
import { DocsTreeItem } from '../common/docsTreeItem';

export class RecentTreeProvider implements vscode.TreeDataProvider<DocsTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DocsTreeItem | undefined | void> = new vscode.EventEmitter<DocsTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<DocsTreeItem | undefined | void> = this._onDidChangeTreeData.event;
    
    private docs: any | undefined;

    constructor(private context: vscode.ExtensionContext, private client: any, private user: YuqueUserDetail) {

    }

    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: DocsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: DocsTreeItem): Promise<DocsTreeItem[] | null | undefined> {
        // this.docs = await this.client.repos.list({ user: this.userId });
        let treeItems: DocsTreeItem[] = [];
        if (Array.isArray(this.docs)) {
            this.docs.forEach((element: { name: string; }) => {
                let treeItem = new DocsTreeItem(element.name);
                treeItems.push(treeItem);
            });
        } else {
            const treeItem = new DocsTreeItem('暂无数据', undefined, undefined, new vscode.ThemeIcon('warning'));
            treeItems.push(treeItem);
        }
        return Promise.resolve(treeItems);
    }
}