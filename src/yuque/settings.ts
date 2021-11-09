/* eslint-disable @typescript-eslint/naming-convention */
import * as path from "path";
import * as fs from "fs";
import { ExtensionContext, ExtensionMode, SecretStorage, commands, Memento } from "vscode";
import { YuqueAuthData } from "../@types/type";
import { verifyCredentials } from "./client";

export const YuqueManagerStateContext: string = 'YuqueManagerStateContext';

export enum YuqueManagerState {
	Initializing = 'Initializing',
	NeedsAuthentication = 'NeedsAuthentication',
    HasSetToken = 'HasSetToken',
	DataLoaded = 'DataLoaded',
}

const SecretStorageYuqueTokenKey:string = 'YuqueAccessToken';

export default class YuqueSettings {
	private static _instance: YuqueSettings;
	private authStorage: SecretStorage;

	public scheme: string;
	public tempRootPath: string;
	public yuqueManagerState: YuqueManagerState;

	constructor(private context: ExtensionContext) {
		this.scheme = "yuque";
		this.authStorage = context.secrets;
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
				await this.authStorage.store(SecretStorageYuqueTokenKey, JSON.stringify(authData));
			} else {
				this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
			}
		} catch (err) {
			console.log("Unable to store Yuque authentication data in Secret Storage.", err);
			this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
		}
	}

	async getAuthData(): Promise<YuqueAuthData> {
		let authData: YuqueAuthData = {
			accessToken: undefined
		};
		let authDataString = await this.authStorage.get(SecretStorageYuqueTokenKey);
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
			await this.authStorage.delete(SecretStorageYuqueTokenKey);
			this.setYuqueManagerState(YuqueManagerState.NeedsAuthentication);
		} catch (error) {
			console.log("Unable to delete yuque token");
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
			console.log('setTempRootPath:', rootPath);
			return rootPath;
		} catch (err) {
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
		} catch (err) {
			console.log("Unable to clean temp path.");
		}
	}

	setYuqueManagerState(state: YuqueManagerState) {
		commands.executeCommand('setContext', YuqueManagerStateContext, state);
	}
}