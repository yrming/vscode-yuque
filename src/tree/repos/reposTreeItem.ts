import * as vscode from 'vscode'

export class ReposTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly namespace?: string,
    public readonly isPublic?: number,
    public readonly tooltip?: string,
    public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
    public readonly iconPath?: string | vscode.ThemeIcon,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState)
  }

  contextValue = 'repo'
}
