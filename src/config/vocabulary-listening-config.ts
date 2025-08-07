// 听力练习相关配置

// 练习模式
export const LISTENING_MODES = [
  { id: 'word', name: '单词听力练习', icon: 'ri-volume-up-line' },
  { id: 'sentence', name: '例句默写练习', icon: 'ri-file-list-line' },
  { id: 'puzzle', name: '例句拼图练习', icon: 'ri-puzzle-line' }
]

// 等级选项
export const LEVEL_OPTIONS = ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']

// 单词数量选项
export const COUNT_OPTIONS = [
  { value: '12', label: '12个' },
  { value: '20', label: '20个' },
  { value: '30', label: '30个' }
]

//例句拼图相关配置
// 单词数量选项
export const COUNT_PRINT_OPTIONS = [
  { value: '3', label: '3个' },
  { value: '7', label: '7个' },
  { value: '12', label: '12个' }
]

// 默认设置
export const DEFAULT_SETTINGS = {
  level: '全部',
  count: '12',
  mode: 'word'
}

// 结果分析文案
export const RESULT_FEEDBACK = {
  excellent: {
    title: '太棒了！',
    message: '您的听力能力非常出色，继续保持！'
  },
  good: {
    title: '做得不错！',
    message: '您的听力能力很好，再接再厉！'
  },
  average: {
    title: '继续加油！',
    message: '您的听力能力有待提高，建议多加练习。'
  },
  poor: {
    title: '需要努力！',
    message: '您的听力能力需要加强，建议多听多练。'
  }
}