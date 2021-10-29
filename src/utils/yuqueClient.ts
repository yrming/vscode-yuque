import * as Yuque from'@yuque/sdk';
import YuqueSettings from './settings';

export async function initClient() {
    let client = null;
    const settings = YuqueSettings.instance;
    const currentAuthSettings = await settings.getAuthData();
    const accessToken = currentAuthSettings.accessToken;
    if (accessToken) {
        client = new Yuque({
            token: accessToken
        });
    }
    return client;
}
