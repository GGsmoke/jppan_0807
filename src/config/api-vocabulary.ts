// Vocabulary API configuration

// Base API URL
export const BASE_API_URL = 'https://www.dlmy.tech/chunshua-api/'

// Vocabulary API endpoints
export const VOCABULARY_API = {
  // Get word cards
  WORD_CARDS: `${BASE_API_URL}chunshua_questions/vocabulary/wordCards`,
  
  // Get word test
  WORD_TEST: `${BASE_API_URL}chunshua_questions/vocabulary/wordTest`
}

// Default request parameters
export const DEFAULT_PARAMS = {
  loginType: 2,
  useType: 0
}

// Word levels
export const WORD_LEVELS = ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']

// Word count options
export const WORD_COUNT_OPTIONS = [
  { value: '12', label: '12个' },
  { value: '20', label: '20个' },
  { value: '30', label: '30个' },
  { value: '40', label: '40个' }
]

// Test types
export const TEST_TYPES = [
  { id: 'meaning', name: '日译中（这个简单）' },
  { id: 'reading', name: '选择读音' },
  { id: 'kanji', name: '选择汉字' }
]

// Tabs configuration
export const VOCABULARY_TABS = [
  { id: 'list', name: '单词列表', icon: 'ri-list-check' },
  { id: 'study', name: '学习时刻', icon: 'ri-book-read-line' },
  { id: 'test', name: '要不来练一下？', icon: 'ri-question-answer-line' },
  { id: 'listening', name: '听力练习', icon: 'ri-volume-up-line' }
]