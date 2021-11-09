import { commands, window, ExtensionContext } from "vscode";
import { registerTrees } from "../tree/common/registerTrees";
import YuqueSettings from "../yuque/settings";

export function registerCommands(context: ExtensionContext): void {
    const settings = YuqueSettings.instance;

    commands.registerCommand('yuque.setToken', async () => {
        const tokenInput = await window.showInputBox({placeHolder: '请输入你的语雀Token'});
        if (tokenInput) {
            await settings.storeAuthData(tokenInput);
            await registerTrees(context);
        }
    });

    commands.registerCommand('yuque.logout', async () => {
        const confirm = await window.showWarningMessage(
            `你确定要退出吗？退出将会清除存放在本地的Token。`,
            '确定', '取消'
        );
        if (confirm) {
            settings.deleteAuthData();
        }
    });
}