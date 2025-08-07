/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function validatePhone(phone: string): boolean {
  // 只能输入数字，且位数在6-15位之间
  const phoneRegex = /^\d{6,15}$/
  return phoneRegex.test(phone)
}

/**
 * 验证密码格式（注册时使用）
 * @param password 密码
 * @returns 是否有效
 */
export function validatePassword(password: string): boolean {
  // 8-12个字符，包含数字+大写字母+小写字母
  if (password.length < 8 || password.length > 12) {
    return false
  }
  
  const hasNumber = /\d/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  
  return hasNumber && hasUpperCase && hasLowerCase
}

/**
 * 获取手机号验证错误信息
 * @param phone 手机号
 * @returns 错误信息，无错误返回空字符串
 */
export function getPhoneError(phone: string): string {
  if (!phone) return ''
  if (!validatePhone(phone)) {
    return '手机号只能输入数字，且位数在6-15位之间'
  }
  return ''
}

/**
 * 获取密码验证错误信息（注册时使用）
 * @param password 密码
 * @returns 错误信息，无错误返回空字符串
 */
export function getPasswordError(password: string): string {
  if (!password) return ''
  if (!validatePassword(password)) {
    return '密码需要8-12个字符，包含数字、大写字母和小写字母'
  }
  return ''
}