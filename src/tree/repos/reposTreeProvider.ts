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

        vscode.commands.registerCommand('yuque.repos.createDoc', async (treeItem: ReposTreeItem) => {
            const title = await vscode.window.showInputBox({ value: '', placeHolder: '请输入文档标题' });
            if (title) {
                if (treeItem.isPublic) {
                    const value = await vscode.window.showQuickPick(['仅自己可见（自己和知识库成员可见）', '互联网可见（互联网所有人可见）'], {
                        placeHolder: '请选择可见范围'
                    });
                    if (value) {
                        const publicVal = value === '互联网可见（互联网所有人可见）' ? 1 : 0;
                        this._createWebviewPanel(context, 'createDoc', title, publicVal, treeItem.namespace);
                    }
                } else {
                    this._createWebviewPanel(context, 'createDoc', title, 0, treeItem.namespace);
                }
                
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

    _createWebviewPanel (context: vscode.ExtensionContext, viewType: string, title: string, isPublic: number, repoNamesapce?: string) {
        const panel = vscode.window.createWebviewPanel(viewType, title, vscode.ViewColumn.One, {
            enableScripts: true
        });
        panel.webview.html = this._getHTMLContent();
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'publish':
                        try {
                            await this.client.docs.create({ namespace: repoNamesapce, data: { title: title, slug: uuidv4(), public: isPublic, body: message.text } });
                            vscode.window.showInformationMessage('创建文档成功！');
                            this.refresh();
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

    _getHTMLContent(title: string = 'Create Doc'): string {
        const html = `
            <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8"/>
                    <title>${title}</title>
                </head>
                <style>
                    .container {
                        display: flex;
                        min-height: 100vh;
                    }
                    .text-area-container {
                        position: relative;
                        flex: 1;
                        display: flex;
                        border-right: 1px solid #999;
                        padding: 10px;
                        background: var(--vscode-input-background);
    
                    }
                    textarea:focus {
                        outline: 0;
                    }
                    textarea {
                        flex: 1;
                        outline: none;
                        resize: none;
                        border: none;
                        padding: 0;
                        background-color: transparent;
                        caret-color: #fff;
                        font-size: 13px;
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-input-foreground);
                    }
                    .publish-btn {
                        position: fixed;
                        left: 0;
                        right: 50%;
                        bottom: 25px;
                        width: 100px;
                        margin: 0 auto;
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        font-family: var(--vscode-font-family);
                        border-radius: 0px;
                        border: 1px solid transparent;
                        outline: none;
                        padding: 4px 12px;
                        font-size: 13px;
                        line-height: 18px;
                        white-space: nowrap;
                        user-select: none;
                    }
                    button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                        cursor: pointer;
                    }
                    .preview-container {
                        flex: 1;
                        padding: 10px;
                        background: transparent;
                    }
                    .empty-container {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .empty-container img {
                        width: 120px;
                        height: auto;
                    }
                </style>
                <body>
                    <div class="container">
                        <div class="text-area-container">
                            <textarea class="markdown" placeholder="# Hello World"></textarea>
                            <button class="publish-btn">发布</button>
                        </div>
                        <div class="preview-container">
                            <div class="empty-container">
                                <img src="https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*Q-bIT76mSLUAAAAAAAAAAAAAARQnAQ" />
                            </div>
                        </div>
                    </div>
                    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
                    <script>
                        const $markdownElem = document.querySelector('.markdown');
                        $markdownElem.focus();
                        $markdownElem.addEventListener('change', handleInput, false);
                        $markdownElem.addEventListener('keyup', handleInput, false);
                        $markdownElem.addEventListener('keypress', handleInput, false);
                        $markdownElem.addEventListener('keydown', handleInput, false);

                        function handleInput(e) {
                            if (marked.parse($markdownElem.value)) {
                                document.querySelector('.preview-container').innerHTML = marked.parse($markdownElem.value);
                            } else {
                                document.querySelector('.preview-container').innerHTML = '<div class="empty-container"><img src="https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*Q-bIT76mSLUAAAAAAAAAAAAAARQnAQ" /></div>'
                            }
                        }

                        const vscode = acquireVsCodeApi();
                        const $publishBtnElem = document.querySelector('.publish-btn');
                        $publishBtnElem.addEventListener('click', function() {
                            if ($markdownElem.value) {
                                vscode.postMessage({
                                    command: 'publish',
                                    text: $markdownElem.value
                                })
                            }
                        })
                    </script>
                </body>
            </html>
        `;
        return html;
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
                const treeItem = new ReposTreeItem(item.name, item.namespace, item.public, item.name, vscode.TreeItemCollapsibleState.Collapsed, new vscode.ThemeIcon('repo'));
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