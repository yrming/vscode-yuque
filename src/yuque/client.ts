import * as Yuque from '@yuque/sdk'
import { window } from 'vscode'
import { YuqueClient } from '../@types/type'
import YuqueSettings from './settings'

export async function initClient(): Promise<YuqueClient | null> {
  let client = null
  const settings = YuqueSettings.instance
  const { accessToken } = await settings.getAuthData()
  if (accessToken) {
    client = new Yuque({
      token: accessToken
    })
    try {
      await client.users.get()
    } catch (error) {
      await window.showErrorMessage(`请检查Token是否正确或者网络是否正常:${error}`)
      client = null
    }
  }
  return client
}

export async function verifyCredentials(accessToken?: string): Promise<boolean> {
  let client = null
  if (accessToken) {
    client = new Yuque({
      token: accessToken
    })
  }
  try {
    const user = await client.users.get()
    return !!user
  } catch (error) {
    await window.showErrorMessage(`请检查Token是否正确或者网络是否正常:${error}`)
    return false
  }
}
