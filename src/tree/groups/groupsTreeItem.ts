import * as vscode from 'vscode';

export class GroupsTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly groupId?: number,
		public readonly tooltip?: string,
		public readonly iconPath?: string | vscode.ThemeIcon,
		public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	contextValue = 'groups';
}