/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { RecentYuqueDoc, YuqueClient, YuqueDoc, YuqueRepo, YuqueUserDetail } from '../../@types/type';
import { DocsTreeItem } from '../common/docsTreeItem';
import { ReposTreeItem } from './reposTreeItem';
import { getHTMLContent } from '../../webview/addOrEditDoc';
import YuqueSettings from '../../yuque/settings';

enum AddOrEditEnum {
	Add = 'Add',
    Edit = 'Edit'
}

enum PublicTextEnum {
    Private = '仅自己可见（自己和知识库成员可见）',
    Public = '互联网可见（互联网所有人可见）'
}

export class ReposTreeProvider implements vscode.TreeDataProvider<ReposTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ReposTreeItem | undefined | void> = new vscode.EventEmitter<ReposTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ReposTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private repos?: YuqueRepo[]; 

    constructor(private context: vscode.ExtensionContext, private client: YuqueClient, private user: YuqueUserDetail, private recentDocsChangeEventEmitter: vscode.EventEmitter<void>) {
        vscode.commands.registerCommand('yuque.repos.create', async () => {
            this._addOrEditRepo(AddOrEditEnum.Add);
        });

        vscode.commands.registerCommand('yuque.repos.createDoc', async (treeItem: ReposTreeItem) => {
            const title = await vscode.window.showInputBox({ value: '', placeHolder: '请输入文档标题' });
            if (title) {
                let publicVal = 0;
                if (treeItem.isPublic) {
                    const value = await vscode.window.showQuickPick([PublicTextEnum.Private, PublicTextEnum.Public], {
                        placeHolder: '请选择可见范围'
                    });
                    if (value) {
                        publicVal = value === PublicTextEnum.Public ? 1 : 0;
                    }
                }
                this._createWebviewPanel(context, 'createDoc', title, publicVal, treeItem.namespace);
            }
        });

        vscode.commands.registerCommand('yuque.repos.editDoc', async (treeItem: DocsTreeItem) => {
            try {
                let docDetail = await client.docs.get({ namespace: treeItem.namespace, slug: treeItem.docId, data: { raw: 1 } });
                if (docDetail.format === 'lakeboard' || docDetail.format === 'laketable' || docDetail.format === 'lakeshow' || docDetail.format === 'lakesheet' || docDetail.format === 'lakemind') {
                    vscode.window.showWarningMessage(
                        `抱歉，该文档的格式为".${docDetail.format}"，暂不支持编辑。`
                    );
                } else {
                    const title = await vscode.window.showInputBox({ value: treeItem.label, placeHolder: '请输入文档标题' });
                    if (title) {
                        const repo = this.repos?.find(item => item.namespace === treeItem.namespace);
                        let publicVal = 0;
                        if (repo?.public) {
                            const value = await vscode.window.showQuickPick([PublicTextEnum.Private, PublicTextEnum.Public], {
                                placeHolder: '请选择可见范围'
                            });
                            if (value) {
                                publicVal = value === PublicTextEnum.Public ? 1 : 0;
                            }
                        }
                        const storeToRecentObj = {
                            id: docDetail.id,
                            title: title,
                            namespace: treeItem.namespace || '',
                            slug: docDetail.slug
                        };
                        this._createWebviewPanel(context, 'editDoc', title, publicVal, treeItem.namespace, docDetail.body, storeToRecentObj);
                        recentDocsChangeEventEmitter.fire();
                    }
                }
            } catch (error) {
                vscode.window.showWarningMessage(`操作失败！${error}`);
            }
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
                    vscode.window.showErrorMessage(`操作失败！${error}`);
                }
            }
        });

        vscode.commands.registerCommand('yuque.repos.deleteDoc', async (treeItem: DocsTreeItem) => {
            const flag = await vscode.window.showWarningMessage(
                `正在删除文档“${treeItem.label}”，该操作不可逆，你确定要删除吗？`,
                '确定', '取消'
            );
            if (flag === '确定') {
                try {
                    await this.client.docs.delete({ namespace: treeItem.namespace, id: treeItem.docId });
                    vscode.window.showInformationMessage('已删除！');
                    this.refresh();
                } catch (error) {
                    vscode.window.showErrorMessage(`操作失败！${error}`);
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
                    vscode.window.showErrorMessage(`操作失败！${error}`);
                }
            }
        }
    }

    _createWebviewPanel (context: vscode.ExtensionContext, viewType: string, title: string, isPublic: number, repoNamesapce?: string, docStr?: string, storeToRecentObj?: RecentYuqueDoc) {
        const panel = vscode.window.createWebviewPanel(viewType, title, vscode.ViewColumn.One, {
            enableScripts: true
        });
        panel.webview.html = getHTMLContent(viewType, docStr);
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'publish':
                        try {
                            if (storeToRecentObj) {
                                await this.client.docs.update({ namespace: repoNamesapce, id: storeToRecentObj.id, data: { title: title, public: isPublic, body: message.text } });
                                const settings = YuqueSettings.instance;
                                await settings.storeDocToRecentDocs(storeToRecentObj);
                                this.recentDocsChangeEventEmitter.fire();
                            } else {
                                await this.client.docs.create({ namespace: repoNamesapce, data: { title: title, slug: uuidv4(), public: isPublic, body: message.text } });
                            }
                            vscode.window.showInformationMessage('操作成功！');
                            this.refresh();
                            vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                        } catch (error) {
                            vscode.window.showErrorMessage(`操作失败！${error}`);
                        }
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
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