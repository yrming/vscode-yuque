import * as vscode from 'vscode';
import YuqueSettings from "./utils/settings";
import { executeCommands } from './commands/executeCommands';
import { registerCommands } from './commands/registerCommands';
import { initClient } from './utils/yuqueClient';

export async function activate(context: vscode.ExtensionContext) {
	YuqueSettings.init(context);
	await executeCommands();
	registerCommands();
	const client = await initClient();
	console.log('client:', client);
}

export function deactivate() {}
