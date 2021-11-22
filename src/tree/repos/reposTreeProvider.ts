/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { YuqueClient, YuqueDoc, YuqueRepo, YuqueUserDetail } from '../../@types/type';
import { DocsTreeItem } from '../common/docsTreeItem';
import { ReposTreeItem } from './ReposTreeItem';

enum AddOrEditEnum {
	Add = 'Add',
    Edit = 'Edit'
}

export class ReposTreeProvider implements vscode.TreeDataProvider<ReposTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ReposTreeItem | undefined | void> = new vscode.EventEmitter<ReposTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ReposTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private repos?: YuqueRepo[]; 

    constructor(private context: vscode.ExtensionContext, private client: YuqueClient, private user: YuqueUserDetail) {
        vscode.commands.registerCommand('yuque.repos.create', async () => {
            this._addOrEditRepo(AddOrEditEnum.Add);
        });

        vscode.commands.registerCommand('yuque.repos.edit', async (treeItem: ReposTreeItem) => {
            this._addOrEditRepo(AddOrEditEnum.Edit, treeItem);
        });

        vscode.commands.registerCommand('yuque.repos.delete', async (treeItem: ReposTreeItem) => {
            const flag = await vscode.window.showWarningMessage(
                `正在删除知识库“${treeItem.label}”，该操作不可逆，一旦操作成功，知识库下的所有内容将会删除。你确定要删除吗？`,
                '确定', '取消'
            );
            if (flag === '确定') {
                try {
                    await this.client.repos.delete({ namespace: treeItem.namespace });
                    vscode.window.showInformationMessage('已删除！');
                    this.refresh();
                } catch (error) {
                    
                }
            }
        });

        vscode.commands.registerCommand('yuque.repos.refresh', async () => {
            this.refresh();
        });
    }

    async _addOrEditRepo(type: AddOrEditEnum, treeItem?: ReposTreeItem) {
        const msg = type === AddOrEditEnum.Add ? '创建成功！' : '修改成功！';
        const name = await vscode.window.showInputBox({ value: treeItem?.label, placeHolder: '请输入知识库名称' });
        if (name) {
            const value = await vscode.window.showQuickPick(['仅自己可见（自己和知识库成员可见）', '互联网可见（互联网所有人可见）'], {
                placeHolder: '请选择可见范围'
            });
            if(value) {
                const publicVal = value === '互联网可见（互联网所有人可见）' ? 1 : 0;
                try {
                    await this.client.repos.create({ user: this.user.id, data: { name: name, slug: uuidv4(), type: "Book", public: publicVal } });
                    vscode.window.showInformationMessage(msg);
                    this.refresh();
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
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
                    arguments: [this.client, namespace, item]
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