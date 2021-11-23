import { commands, window, ExtensionContext, EventEmitter, ViewColumn } from "vscode";
import { marked } from 'marked';
import { YuqueClient, YuqueDoc } from "../@types/type";
import { registerTrees } from "../tree/common/registerTrees";
import YuqueSettings from "../yuque/settings";

export function registerCommands(context: ExtensionContext, recentDocsChangeEventEmitter: EventEmitter<void>): void {
    const settings = YuqueSettings.instance;

    commands.registerCommand('yuque.setToken', async () => {
        const tokenInput = await window.showInputBox({placeHolder: '请输入你的语雀Token'});
        if (tokenInput) {
            await settings.storeAuthData(tokenInput);
            await registerTrees(context, recentDocsChangeEventEmitter);
        }
    });

    commands.registerCommand('yuque.logout', async () => {
        const flag = await window.showWarningMessage(
            `你确定要退出吗？退出将会清除存放在本地的Token以及最近浏览的数据。`,
            '确定', '取消'
        );
        if (flag === '确定') {
            await settings.deleteAuthData();
            await settings.deleteRecentDocs();
            recentDocsChangeEventEmitter.fire();
        }
    });

    commands.registerCommand('yuque.clearRecent', async () => {
        const flag = await window.showWarningMessage(
            `你确定清除最近浏览的数据吗？`,
            '确定', '取消'
        );
        if (flag === '确定') {
            await settings.deleteRecentDocs();
            recentDocsChangeEventEmitter.fire();
        }
    });

    commands.registerCommand('yuque.openDoc', async (client: YuqueClient, namespace: string, doc: YuqueDoc) => {
        try {
            let docDetail = await client.docs.get({ namespace: namespace, slug: doc.slug, data: { raw: 1 } });
            if (docDetail.format === 'lakeboard' || docDetail.format === 'laketable' || docDetail.format === 'lakeshow' || docDetail.format === 'lakesheet' || docDetail.format === 'lakemind') {
                window.showWarningMessage(
                    `抱歉，该文档的格式为".${docDetail.format}"，暂不支持查看。`
                );
            } else {
                const panel = window.createWebviewPanel(docDetail.title, docDetail.title, ViewColumn.One, {
                    enableScripts: true
                });
                panel.webview.html = getHTMLContent(docDetail.title, docDetail.body);
                const obj = {
                    id: doc.id,
                    title: doc.title,
                    namespace: namespace,
                    slug: doc.slug
                };
                await settings.storeDocToRecentDocs(obj);
                recentDocsChangeEventEmitter.fire();
            }
        } catch (error) {
            window.showWarningMessage(`操作失败！${error}`);
        }
    });
}

function getHTMLContent(title: string, body: string): string {
    const bodyContent = marked.parse(body);
    const html = `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>${title}</title>
            </head>
            <body style="width: 900px; margin: 0 auto;">
                <div>
                    ${bodyContent}
                </div>
            </body>
        </html>
    `;
    return html;
}