import * as vscode from 'vscode';

export class DocsTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly tooltip?: string,
		public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
		public readonly iconPath?: string | vscode.ThemeIcon,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	contextValue = 'doc';
}