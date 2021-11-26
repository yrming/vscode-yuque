import * as vscode from 'vscode';
import { GroupsTreeItem } from './groupsTreeItem';
import { downloadIcon } from '../common/treeItemIconPath';
import { YuqueDoc, YuqueGroup, YuqueRepo, YuqueUserDetail } from '../../@types/type';
import { ReposTreeItem } from '../repos/ReposTreeItem';
import { DocsTreeItem } from '../common/docsTreeItem';

export class GroupsTreeProvider implements vscode.TreeDataProvider<GroupsTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<GroupsTreeItem | undefined | void> = new vscode.EventEmitter<GroupsTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<GroupsTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private groups?: YuqueGroup[];
    readonly subPath = 'groups';

    constructor(private context: vscode.ExtensionContext, private client: any, private user: YuqueUserDetail) { 
        vscode.commands.registerCommand('yuque.groups.refresh', async () => {
            this.refresh();
        });
    }

    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: GroupsTreeItem | ReposTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: GroupsTreeItem | ReposTreeItem): Promise<GroupsTreeItem[] | ReposTreeItem[] | DocsTreeItem[] | null | undefined> {
        if (element) {
            if (element instanceof GroupsTreeItem) {
                return this.getReposTreeItems(element.groupId);
            } else if (element instanceof ReposTreeItem) {
                return this.getDocsTreeItems(element.namespace);
            }
        } else {
            return this.getTopLevelTreeItems();
        }
    }

    async getTopLevelTreeItems(): Promise<GroupsTreeItem[]> {
        let treeItems: GroupsTreeItem[] = [];
        this.groups = await this.client.groups.list({ login: this.user.id });
        if (Array.isArray(this.groups) && this.groups.length > 0) {
            const makeTreeItem = async (item: YuqueGroup) => {
                const fileUri = await downloadIcon(item.avatar_url, this.subPath, item.id);
                const treeItem = new GroupsTreeItem(item.name, item.id, item.description, fileUri, vscode.TreeItemCollapsibleState.Collapsed);
                treeItems.push(treeItem);
            };
            const promises = this.groups.map((item: YuqueGroup) => makeTreeItem(item));
            await Promise.all(promises);
        } else {
            const treeItem = new GroupsTreeItem('暂无数据', undefined, undefined, new vscode.ThemeIcon('warning'));
            treeItems.push(treeItem);
        }
        return Promise.resolve(treeItems);
    }

    async getReposTreeItems(groupId?: number) {
        const repos = await this.client.repos.list({ group: groupId });
        let treeItems: ReposTreeItem[] = [];
        if (Array.isArray(repos)) {
            repos.forEach((item: YuqueRepo) => {
                const treeItem = new ReposTreeItem(item.name, item.namespace, item.public, item.name, vscode.TreeItemCollapsibleState.Collapsed, new vscode.ThemeIcon(item.public ? 'globe' : 'lock'));
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
                const treeItem = new DocsTreeItem(item.title, item.title, item.id, namespace, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon('file-text'), {
                    title: 'OpenDoc',
                    command: 'yuque.openDoc',
                    arguments: [this.client, namespace, item]
                });
                treeItems.push(treeItem);
            });
        } else {
            const treeItem = new DocsTreeItem('暂无文档', undefined, undefined, undefined, undefined, new vscode.ThemeIcon('warning'));
            treeItems.push(treeItem);
        }
        return Promise.resolve(treeItems);
    }
}