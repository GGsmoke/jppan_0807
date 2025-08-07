import { getWordAudioUrl, getExampleAudioUrl } from './crypto'

/**
 * 检查音频URL是否可访问
 * @param url 音频URL
 * @returns Promise<boolean> 是否可访问
 */
async function checkAudioAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type') ?? ''
    return response.ok && contentType.includes('audio')
  } catch {
    return false
  }
}

/**
 * 播放单词音频
 * @param wordAudioUrl 加密的音频URL
 * @param onPlay 播放开始回调
 * @param onEnd 播放结束回调
 * @param onError 播放错误回调
 */
// 全局音频实例管理
const activeAudioInstances = new Set<HTMLAudioElement>()

// 修改播放函数，添加音频实例管理
export async function playWordAudio(
  wordAudioUrl: string,
  onPlay?: () => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<void> {
  const audioUrl = getWordAudioUrl(wordAudioUrl)
  if (!audioUrl) {
    console.error('无法解密音频URL')
    onError?.()
    return
  }
  
  const isAccessible = await checkAudioAccessibility(audioUrl)
  if (!isAccessible) {
    console.error('音频文件不可访问:', audioUrl)
    onError?.()
    return
  }
  
  const audio = new Audio(audioUrl)
  activeAudioInstances.add(audio) // 添加到管理集合
  
  audio.preload = 'metadata'
  audio.crossOrigin = 'anonymous'
  
  audio.onplay = () => {
    onPlay?.()
  }
  
  audio.onended = () => {
    activeAudioInstances.delete(audio) // 播放结束时移除
    onEnd?.()
  }
  
  audio.onerror = () => {
    activeAudioInstances.delete(audio) // 出错时移除
    console.error('音频播放失败 - 文件格式不支持或服务器配置问题:', audioUrl)
    onError?.()
  }
  
  audio.play().catch(error => {
    activeAudioInstances.delete(audio) // 播放失败时移除
    console.error('音频播放失败 - 播放器错误:', error, '音频URL:', audioUrl)
    onError?.()
  })
}

/**
 * 播放例句音频
 * @param wordAudioUrl 加密的音频URL
 * @param exampleIndex 例句索引 (0, 1, 2)
 * @param onPlay 播放开始回调
 * @param onEnd 播放结束回调
 * @param onError 播放错误回调
 */
export async function playExampleAudio(
  wordAudioUrl: string,
  exampleIndex: number,
  onPlay?: () => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<void> {
  const audioUrl = getExampleAudioUrl(wordAudioUrl, exampleIndex)
  if (!audioUrl) {
    console.error('无法解密例句音频URL')
    onError?.()
    return
  }
  
  const isAccessible = await checkAudioAccessibility(audioUrl)
  if (!isAccessible) {
    console.error('例句音频文件不可访问:', audioUrl)
    onError?.()
    return
  }
  
  const audio = new Audio(audioUrl)
  activeAudioInstances.add(audio) // 添加到管理集合
  
  audio.preload = 'metadata'
  audio.crossOrigin = 'anonymous'
  
  audio.onplay = () => {
    onPlay?.()
  }
  
  audio.onended = () => {
    activeAudioInstances.delete(audio) // 播放结束时移除
    onEnd?.()
  }
  
  audio.onerror = () => {
    activeAudioInstances.delete(audio) // 出错时移除
    console.error('例句音频播放失败 - 文件格式不支持或服务器配置问题:', audioUrl)
    onError?.()
  }
  
  audio.play().catch(error => {
    activeAudioInstances.delete(audio) // 播放失败时移除
    console.error('例句音频播放失败 - 播放器错误:', error, '音频URL:', audioUrl)
    onError?.()
  })
}

/**
 * 停止所有音频播放（增强版）
 */
export function stopAllAudio(): void {
  // 停止所有正在播放的音频元素
  const audioElements = document.querySelectorAll('audio')
  audioElements.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
  
  // 停止管理的音频实例
  activeAudioInstances.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
  activeAudioInstances.clear()
}
