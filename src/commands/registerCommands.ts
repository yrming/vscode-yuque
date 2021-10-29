import { commands, window } from "vscode";
import YuqueSettings from "../utils/settings";

export function registerCommands(): void {
    const settings = YuqueSettings.instance;

    commands.registerCommand('yuque.setToken', async () => {
        const tokenInput = await window.showInputBox({placeHolder: 'Access Token'});
        if (tokenInput) {
            await settings.storeAuthData(tokenInput);
            commands.executeCommand('setContext', 'yuque.hasSetToken', true);
        }
    });
}