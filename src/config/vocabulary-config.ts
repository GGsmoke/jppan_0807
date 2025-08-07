// 单词相关配置

// API端点
export const VOCABULARY_API = {
  WORD_CARDS: '/api/vocabulary/wordCards',
  WORD_TEST: '/api/vocabulary/wordTest'
}

// 单词等级
export const WORD_LEVELS = ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']

// 单词数量选项
export const WORD_COUNT_OPTIONS = [
  { value: '12', label: '12个' },
  { value: '20', label: '20个' },
  { value: '30', label: '30个' },
  { value: '40', label: '40个' }
]

// 测试类型
export const TEST_TYPES = [
  { id: 'meaning', name: '日译中' },
  { id: 'reading', name: '选择读音' },
  { id: 'kanji', name: '选择汉字' }
]

// 标签页配置
export const VOCABULARY_TABS = [
  { id: 'list', name: '单词列表', icon: 'ri-list-check' },
  { id: 'study', name: '学习时刻', icon: 'ri-book-read-line' },
  { id: 'test', name: '单词记忆练习', icon: 'ri-question-answer-line' }
]

// 默认测试配置
export const DEFAULT_TEST_CONFIG = {
  level: '全部',
  count: '10',
  type: 'meaning'
}