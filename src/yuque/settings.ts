/* eslint-disable @typescript-eslint/naming-convention */
import * as path from "path";
import * as fs from "fs";
import { ExtensionContext, ExtensionMode, SecretStorage, commands } from "vscode";
import { RecentYuqueDoc, YuqueAuthData } from "../@types/type";
import { verifyCredentials } from "./client";

export const YuqueManagerStateContext: string = 'YuqueManagerStateContext';

export enum YuqueManagerState {
	Initializing = 'Initializing',
	NeedsAuthentication = 'NeedsAuthentication',
    HasSetToken = 'HasSetToken',
	DataLoaded = 'DataLoaded',
}

const SecretStorageYuqueTokenKey: string = 'YuqueAccessToken';
const SecretStorageYuqueRecentDocsKey: string = 'YuqueRecentDocs';
const LocalRecentDocsMaxNumber: number = 20;

export default class YuqueSettings {
	private static _instance: YuqueSettings;
	private secretStorage: SecretStorage;

	public scheme: string;
	public tempRootPath: string;
	public yuqueManagerState: YuqueManagerState;

	constructor(private context: ExtensionContext) {
		this.scheme = "yuque";
		this.secretStorage = context.secrets;
		this.tempRootPath = this.setTempRootPath();
		this.yuqueManagerState = YuqueManagerState.Initializing;
	}

	static init(context: ExtensionContext): void {
		YuqueSettings._instance = new YuqueSettings(context);
	}

	static get instance(): YuqueSettings {
		return YuqueSettings._instance;
	}

	async storeAuthData(accessToken?: string): Promise<void> {
		try {
			let authData = await this.getAuthData();
			if (accessToken) {
                authData.accessToken = accessToken;
            };
			const valid = await verifyCredentials(authData.accessToken);
			if (valid) {
				this.setYuqueManagerState(YuqueManagerState.HasSetToken);
				await this.secretStorage.store(SecretStorageYuqueTokenKey, JSON.stringify(authData));
			} else {
				this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
			}
		} catch (error) {
			console.log("Unable to store Yuque authentication data in Secret Storage.", error);
			this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
		}
	}

	async getAuthData(): Promise<YuqueAuthData> {
		let authData: YuqueAuthData = {
			accessToken: undefined
		};
		let authDataString = await this.secretStorage.get(SecretStorageYuqueTokenKey);
		if (authDataString) {
			authData = JSON.parse(authDataString) as YuqueAuthData;
			const valid = await verifyCredentials(authData.accessToken);
			if (valid) {
				this.setYuqueManagerState(YuqueManagerState.HasSetToken);
			} else {
				this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
			}
		} else {
			this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
		}
		return authData;
	}

	async deleteAuthData(): Promise<void> {
		try {
			await this.secretStorage.delete(SecretStorageYuqueTokenKey);
			this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
		} catch (error) {
			console.log("Unable to delete yuque token");
		}
	}

	async getRecentDocs(): Promise<RecentYuqueDoc[]> {
		let docs: RecentYuqueDoc[] = [];
		const docsString = await this.secretStorage.get(SecretStorageYuqueRecentDocsKey);
		if (docsString) {
			docs = JSON.parse(docsString);
		}
		return docs;
	}

	async storeDocToRecentDocs(doc: RecentYuqueDoc): Promise<void> {
		try {
			let docs = await this.getRecentDocs();
			if (docs.length < LocalRecentDocsMaxNumber) {
				const targetIndex = docs.findIndex(item => item.id === doc.id);
				if (targetIndex > -1) {
					docs.splice(targetIndex, 1);
				}
			} else {
				docs.pop();
			}
			docs.unshift(doc);
			await this.secretStorage.store(SecretStorageYuqueRecentDocsKey, JSON.stringify(docs));
		} catch (error) {
			console.log("Unable to store Yuque recent docs in Secret Storage.", error);
		}
	}

	async deleteRecentDocs(): Promise<void> {
		try {
			await this.secretStorage.delete(SecretStorageYuqueRecentDocsKey);
		} catch (error) {
			console.log("Unable to delete yuque recent docs");
		}
	}

	setTempRootPath(): string {
		try {
			const rootPath =
				this.context.extensionMode === ExtensionMode.Test
					? path.join(__dirname, "..", "..", "temp")
					: path.join(this.context.globalStorageUri.fsPath, "temp");

			fs.rmdirSync(rootPath, { recursive: true });
			fs.mkdirSync(rootPath, { recursive: true });
			return rootPath;
		} catch (error) {
			throw new Error("Unable to set tempRootPath.");
		}
	}

	static removeTempEntry(entryPath: string): void {
		try {
			fs.unlinkSync(entryPath);
		} catch (err) {
			console.log("Unable to delete entry file.");
		}
	}

	static clean(): void {
		try {
			fs.rmdirSync(this._instance.tempRootPath, { recursive: true });
		} catch (error) {
			console.log("Unable to clean temp path.");
		}
	}

	setYuqueManagerState(state: YuqueManagerState) {
		commands.executeCommand('setContext', YuqueManagerStateContext, state);
	}
}