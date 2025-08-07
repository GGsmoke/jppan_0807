// API 端点配置文件
// 集中管理所有API请求地址和相关配置

// 基础URL
export const BASE_API_URL = 'https://www.dlmy.tech/chunshua-api/'

// 词汇相关API
export const VOCABULARY_API = {
  // 获取词汇卡片
  WORD_CARDS: `${BASE_API_URL}chunshua_questions/vocabulary/wordCards`,
  
  // 获取词汇测试
  WORD_TEST: `${BASE_API_URL}chunshua_questions/vocabulary/wordTest`
}

// 语法相关API
export const GRAMMAR_API = {
  // 获取语法卡片
  GRAMMAR_CARDS: `${BASE_API_URL}chunshua_questions/grammar/grammerCards`,
  
  // 获取语法测试
  GRAMMAR_TEST: `${BASE_API_URL}chunshua_questions/grammar/grammarTest`
}

// 练习题相关API
export const PRACTICE_API = {
  // 单词题
  WORD_QUESTIONS: `${BASE_API_URL}chunshua_questions/questions/getDanCiIndTi`,
  
  // 语法题
  GRAMMAR_QUESTIONS: `${BASE_API_URL}chunshua_questions/questions/getYuFaIndTi`,
  
  // 阅读理解题
  READING_QUESTIONS: `${BASE_API_URL}chunshua_questions/questions/getYueDuComTi`,
  
  // 听力单题
  LISTENING_SINGLE_QUESTIONS: `${BASE_API_URL}chunshua_questions/questions/getTiLiIndTi`,
  
  // 听力综合题
  LISTENING_COMBINED_QUESTIONS: `${BASE_API_URL}chunshua_questions/questions/getTiLiComTi`
}

// 用户相关API
export const USER_API = {
  // 登录
  LOGIN: `${BASE_API_URL}chunshua_users/info/chunshuaLogin`,
  
  // 注册
  REGISTER: `${BASE_API_URL}chunshua_users/info/chunshuaRegister`,
  
  // 修改密码
  CHANGE_PASSWORD: `${BASE_API_URL}chunshua_users/info/changePassword`,
  
  // 兑换码
  REDEEM_CODE: `${BASE_API_URL}chunshua_users/info/redeemCodePC`
}

// API请求参数配置
export const API_CONFIG = {
  // 默认请求头
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // 登录类型
  LOGIN_TYPE: 2,
  
  // 使用类型
  USE_TYPE: 0
}

// 媒体资源基础URL
export const MEDIA_BASE_URL = 'https://csry.oss-cn-beijing.aliyuncs.com/'