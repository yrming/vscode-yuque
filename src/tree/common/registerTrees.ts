import * as vscode from 'vscode';
import { RecentTreeProvider } from '../recent/recentTreeProvider';
import { ReposTreeProvider } from '../repos/reposTreeProvider';
import { GroupsTreeProvider } from '../groups/groupsTreeProvider';
import { ProfileTreeProvider } from '../profile/profileTreeProvider';
import { initClient } from '../../yuque/client';

export async function registerTrees(context: vscode.ExtensionContext): Promise<void> {
    try {
        const client = await initClient();
        const user = await client.users.get();
        if (client && user) {
            const recentTreeProvider = new RecentTreeProvider(context, client, user);
            vscode.window.registerTreeDataProvider("yuque.recent", recentTreeProvider);

            const reposTreeProvider = new ReposTreeProvider(context, client, user);
            vscode.window.registerTreeDataProvider("yuque.repos", reposTreeProvider);

            const groupsTreeProvider = new GroupsTreeProvider(context, client, user);
            vscode.window.registerTreeDataProvider("yuque.groups", groupsTreeProvider);

            const profileTreeProvider = new ProfileTreeProvider(context, client, user);
            vscode.window.registerTreeDataProvider("yuque.profile", profileTreeProvider); 
        }
    } catch (error) {
        console.log('Unable to register trees.', error);
    }
}