import * as vscode from 'vscode';
import { YuqueUserDetail } from '../../@types/type';
import { ProfileTreeItem } from './ProfileTreeItem';
import { downloadIcon } from '../common/treeItemIconPath';

export class ProfileTreeProvider implements vscode.TreeDataProvider<ProfileTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProfileTreeItem | undefined | void> = new vscode.EventEmitter<ProfileTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ProfileTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    readonly subPath = 'profile';

    constructor(private context: vscode.ExtensionContext, private client: any, private user: YuqueUserDetail) {

    }

    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: ProfileTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: ProfileTreeItem): Promise<ProfileTreeItem[] | null | undefined> {
        // const fileUri = await downloadIcon(this.user.avatar_url, this.subPath, this.user.id);
        // console.log('fileUri123:', fileUri);
        console.log('user:', this.user);
        const treeItems: ProfileTreeItem[] = [
            new ProfileTreeItem(`昵称：${this.user.name}`, new vscode.ThemeIcon('account')),
            new ProfileTreeItem(`账号类型：${this.user.type === 'Group' ? '团队' : '个人'}`, this.user.type === 'Group' ? new vscode.ThemeIcon('organization') : new vscode.ThemeIcon('person')),
            new ProfileTreeItem(`关注者：${this.user.followers_count}`, new vscode.ThemeIcon('arrow-right')),
            new ProfileTreeItem(`关注了：${this.user.following_count}`, new vscode.ThemeIcon('arrow-left')),
            new ProfileTreeItem(`简介：${this.user.description}`, new vscode.ThemeIcon('info')),
        ];
        
        return Promise.resolve(treeItems);
    }
}