import * as path from "path";
import * as process from "process";
import * as fs from "fs";
import { ExtensionContext, ExtensionMode, SecretStorage } from "vscode";

export default class YuqueSettings {
	private static _instance: YuqueSettings;
	private authStorage: SecretStorage;

	public platform: string;
	public scheme: string;
	public tempRootPath: string;

	constructor(private context: ExtensionContext) {
		this.scheme = "yuque";
		this.authStorage = context.secrets;
		this.tempRootPath = this.setTempRootPath();
		this.platform = this.getPlatform();
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
			this.authStorage.store("yuqueAccessToken", JSON.stringify(authData));
		} catch (err) {
			console.log("Unable to store Yuque authentication data in Secret Storage.", err);
		}
	}

	async getAuthData(): Promise<YuqueAuthData> {
		let authDataString = await this.authStorage.get("yuqueAccessToken");
		if (authDataString) {
			return JSON.parse(authDataString) as YuqueAuthData;
		} else {
			const authData: YuqueAuthData = {
				accessToken: undefined
			};
			return authData;
		}
	}

	getPlatform(): string {
		if (process.platform === "win32") {
			return "win32";
		}
		if (process.platform === "linux") {
			return "linux";
		}
		if (process.platform === 'darwin') {
			return "darwin";
		}
		throw new Error(`Sorry, the platform '${process.platform}' is not supported by Yuque`);
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
}