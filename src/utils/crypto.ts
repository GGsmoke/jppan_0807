import CryptoJS from 'crypto-js'

const PREFIX = "chun"
const SUFFIX = "shua"
const KEY = "thisIsASecretKey" // 16字节
const INIT_VECTOR = "RandomInitVector" // 16字节
export function decryptUrl(encryptedBase64: string): string | null {
  try {
    // 解密 Base64
    const key = CryptoJS.enc.Utf8.parse(KEY)
    const iv = CryptoJS.enc.Utf8.parse(INIT_VECTOR)
    
    const decrypted = CryptoJS.AES.decrypt(
      encryptedBase64,
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    )
    
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
    
    // 检查并去除前后缀
    if (!decryptedStr.startsWith(PREFIX) || !decryptedStr.endsWith(SUFFIX)) {
      throw new Error("解密数据格式错误")
    }
    
    const url = decryptedStr.substring(
      PREFIX.length,
      decryptedStr.length - SUFFIX.length
    )
    return url.replace(/^http:\/\//, 'http://')
  } catch (e) {
    return null
  }
}
export function getWordAudioUrl(wordAudioUrl: string): string | null {
  return decryptUrl(wordAudioUrl)
}
export function getExampleAudioUrl(wordAudioUrl: string, exampleIndex: number): string | null {
  const baseUrl = decryptUrl(wordAudioUrl)
  if (!baseUrl) return null
  
  return baseUrl.replace(/\.mp3$/, `_${exampleIndex}.mp3`)
}
export function getVideoUrl(encryptedVideoUrl: string): string | null {
  return decryptUrl(encryptedVideoUrl)
}