const API_BASE_URL = 'https://www.dlmy.tech/chunshua-api/'

export const API_ENDPOINTS = {
  vocabulary: {
    wordCards: `${API_BASE_URL}chunshua_questions/vocabulary/wordCards`
  },
  grammar: {
    grammarCards: `${API_BASE_URL}chunshua_questions/grammar/grammerCards`
  },
  practice: {
    questions: {
      getDanCiIndTi: `${API_BASE_URL}chunshua_questions/questions/getDanCiIndTi`,
      getYuFaIndTi: `${API_BASE_URL}chunshua_questions/questions/getYuFaIndTi`,
      getYueDuComTi: `${API_BASE_URL}chunshua_questions/questions/getYueDuComTi`,
      getTiLiIndTi: `${API_BASE_URL}chunshua_questions/questions/getTiLiIndTi`,
      getTiLiComTi: `${API_BASE_URL}chunshua_questions/questions/getTiLiComTi`
    }
  },
  user: {
    changePassword: `${API_BASE_URL}chunshua_users/info/changePassword`,
    loginIn: `${API_BASE_URL}chunshua_users/info/chunshuaLogin`,
    chunshuaRegisterIn: `${API_BASE_URL}chunshua_users/info/chunshuaRegister`,
    redeemCodePC: `${API_BASE_URL}chunshua_users/info/redeemCodePC`
  }
}