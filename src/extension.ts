import * as vscode from 'vscode'
import YuqueSettings from './yuque/settings'
import { registerCommands } from './commands/registerCommands'
import { registerTrees } from './tree/common/registerTrees'

export async function activate(context: vscode.ExtensionContext) {
  YuqueSettings.init(context)
  const recentDocsChangeEventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter()
  registerCommands(context, recentDocsChangeEventEmitter)
  registerTrees(context, recentDocsChangeEventEmitter)
}

export function deactivate() {}
