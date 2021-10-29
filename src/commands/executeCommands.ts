import { commands } from "vscode";
import YuqueSettings from "../utils/settings";

export async function executeCommands(): Promise<void> {
    const settings = YuqueSettings.instance;
    const currentAuthSettings = await settings.getAuthData();
    const accessToken = currentAuthSettings.accessToken;
    commands.executeCommand('setContext', 'yuque.hasSetToken', !!accessToken);
    console.log('accessToken:', accessToken);
}