import { API_ENDPOINTS } from './api'

interface QuestionBank {
  jlptLevel: string
  tixing: string
  question: string
  questionBankId: number
  apiEndpoint: string
}

// Map questionBankId to API endpoints
const getApiEndpoint = (id: number): string => {
  // 单词题
  if ([101, 102, 103, 104, 201, 202, 203, 204, 205, 206, 301, 302, 303, 304, 305, 401, 402, 403, 404, 405, 501, 502, 503, 504].includes(id)) {
    return API_ENDPOINTS.practice.questions.getDanCiIndTi
  }
  // 语法题
  if ([111, 112, 211, 212, 311, 312, 411, 412, 511, 512].includes(id)) {
    return API_ENDPOINTS.practice.questions.getYuFaIndTi
  }
  // 阅读理解题
  if ([113, 121, 122, 123, 124, 125, 126, 213, 221, 222, 223, 224, 225, 313, 321, 322, 323, 324].includes(id)) {
    return API_ENDPOINTS.practice.questions.getYueDuComTi
  }
  // 听力单题
  if ([131, 132, 133, 134, 135, 231, 232, 233, 234, 235, 331, 332, 333, 334, 335, 431, 432, 433, 531].includes(id)) {
    return API_ENDPOINTS.practice.questions.getTiLiIndTi
  }
  // 听力综合题
  if ([136, 236].includes(id)) {
    return API_ENDPOINTS.practice.questions.getTiLiComTi
  }
  return ''
}

export const questionBanks: QuestionBank[] = [
  // N1
  { jlptLevel: 'N1', tixing: '词汇', question: '問題 1 - 汉字读法', questionBankId: 101, apiEndpoint: getApiEndpoint(101) },
  { jlptLevel: 'N1', tixing: '词汇', question: '問題 2 - 前后关系', questionBankId: 102, apiEndpoint: getApiEndpoint(102) },
  { jlptLevel: 'N1', tixing: '词汇', question: '問題 3 - 近义替换', questionBankId: 103, apiEndpoint: getApiEndpoint(103) },
  { jlptLevel: 'N1', tixing: '词汇', question: '問題 4 - 用法', questionBankId: 104, apiEndpoint: getApiEndpoint(104) },
  { jlptLevel: 'N1', tixing: '文法', question: '問題 5 - 语法形式的判断', questionBankId: 111, apiEndpoint: getApiEndpoint(111) },
  { jlptLevel: 'N1', tixing: '文法', question: '問題 6 - 句子的组织', questionBankId: 112, apiEndpoint: getApiEndpoint(112) },
  { jlptLevel: 'N1', tixing: '文法', question: '問題 7 - 文章语法', questionBankId: 113, apiEndpoint: getApiEndpoint(113) },
  { jlptLevel: 'N1', tixing: '読解', question: '問題 8 - 内容理解（短篇）', questionBankId: 121, apiEndpoint: getApiEndpoint(121) },
  { jlptLevel: 'N1', tixing: '読解', question: '問題 9 - 内容理解（中篇）', questionBankId: 122, apiEndpoint: getApiEndpoint(122) },
  { jlptLevel: 'N1', tixing: '読解', question: '問題 10 - 内容理解（长篇）', questionBankId: 123, apiEndpoint: getApiEndpoint(123) },
  { jlptLevel: 'N1', tixing: '読解', question: '問題 11 - 综合理解（読解）', questionBankId: 124, apiEndpoint: getApiEndpoint(124) },
  { jlptLevel: 'N1', tixing: '読解', question: '問題 12 - 论点理解（长篇）', questionBankId: 125, apiEndpoint: getApiEndpoint(125) },
  { jlptLevel: 'N1', tixing: '読解', question: '問題 13 - 信息检索', questionBankId: 126, apiEndpoint: getApiEndpoint(126) },
  { jlptLevel: 'N1', tixing: '聴解', question: '問題 1 - 问题理解', questionBankId: 131, apiEndpoint: getApiEndpoint(131) },
  { jlptLevel: 'N1', tixing: '聴解', question: '問題 2 - 重点理解', questionBankId: 132, apiEndpoint: getApiEndpoint(132) },
  { jlptLevel: 'N1', tixing: '聴解', question: '問題 3 - 概要理解', questionBankId: 133, apiEndpoint: getApiEndpoint(133) },
  { jlptLevel: 'N1', tixing: '聴解', question: '問題 4 - 即时应答', questionBankId: 134, apiEndpoint: getApiEndpoint(134) },
  { jlptLevel: 'N1', tixing: '聴解', question: '問題 5 - 综合理解　問題一', questionBankId: 135, apiEndpoint: getApiEndpoint(135) },
  { jlptLevel: 'N1', tixing: '聴解', question: '問題 5 - 综合理解　問題二', questionBankId: 136, apiEndpoint: getApiEndpoint(136) },

  // N2
  { jlptLevel: 'N2', tixing: '词汇', question: '問題 1 - 汉字读法', questionBankId: 201, apiEndpoint: getApiEndpoint(201) },
  { jlptLevel: 'N2', tixing: '词汇', question: '問題 2 - 汉字书写', questionBankId: 202, apiEndpoint: getApiEndpoint(202) },
  { jlptLevel: 'N2', tixing: '词汇', question: '問題 3 - 词语构成', questionBankId: 203, apiEndpoint: getApiEndpoint(203) },
  { jlptLevel: 'N2', tixing: '词汇', question: '問題 4 - 前后关系', questionBankId: 204, apiEndpoint: getApiEndpoint(204) },
  { jlptLevel: 'N2', tixing: '词汇', question: '問題 5 - 近义替换', questionBankId: 205, apiEndpoint: getApiEndpoint(205) },
  { jlptLevel: 'N2', tixing: '词汇', question: '問題 6 - 用法', questionBankId: 206, apiEndpoint: getApiEndpoint(206) },
  { jlptLevel: 'N2', tixing: '文法', question: '問題 7 - 语法形式的判断', questionBankId: 211, apiEndpoint: getApiEndpoint(211) },
  { jlptLevel: 'N2', tixing: '文法', question: '問題 8 - 句子的组织', questionBankId: 212, apiEndpoint: getApiEndpoint(212) },
  { jlptLevel: 'N2', tixing: '文法', question: '問題 9 - 文章语法', questionBankId: 213, apiEndpoint: getApiEndpoint(213) },
  { jlptLevel: 'N2', tixing: '読解', question: '問題 10 - 内容理解（短篇）', questionBankId: 221, apiEndpoint: getApiEndpoint(221) },
  { jlptLevel: 'N2', tixing: '読解', question: '問題 11 - 内容理解（中篇）', questionBankId: 222, apiEndpoint: getApiEndpoint(222) },
  { jlptLevel: 'N2', tixing: '読解', question: '問題 12 - 综合理解（読解）', questionBankId: 223, apiEndpoint: getApiEndpoint(223) },
  { jlptLevel: 'N2', tixing: '読解', question: '問題 13 - 论点理解（长篇）', questionBankId: 224, apiEndpoint: getApiEndpoint(224) },
  { jlptLevel: 'N2', tixing: '読解', question: '問題 14 - 信息检索', questionBankId: 225, apiEndpoint: getApiEndpoint(225) },
  { jlptLevel: 'N2', tixing: '聴解', question: '問題 1 - 问题理解', questionBankId: 231, apiEndpoint: getApiEndpoint(231) },
  { jlptLevel: 'N2', tixing: '聴解', question: '問題 2 - 重点理解', questionBankId: 232, apiEndpoint: getApiEndpoint(232) },
  { jlptLevel: 'N2', tixing: '聴解', question: '問題 3 - 概要理解', questionBankId: 233, apiEndpoint: getApiEndpoint(233) },
  { jlptLevel: 'N2', tixing: '聴解', question: '問題 4 - 即时应答', questionBankId: 234, apiEndpoint: getApiEndpoint(234) },
  { jlptLevel: 'N2', tixing: '聴解', question: '問題 5 - 综合理解　問題一', questionBankId: 235, apiEndpoint: getApiEndpoint(235) },
  { jlptLevel: 'N2', tixing: '聴解', question: '問題 5 - 综合理解　問題二', questionBankId: 236, apiEndpoint: getApiEndpoint(236) },

  // N3
  { jlptLevel: 'N3', tixing: '词汇', question: '問題 1 - 汉字读法', questionBankId: 301, apiEndpoint: getApiEndpoint(301) },
  { jlptLevel: 'N3', tixing: '词汇', question: '問題 2 - 汉字书写', questionBankId: 302, apiEndpoint: getApiEndpoint(302) },
  { jlptLevel: 'N3', tixing: '词汇', question: '問題 3 - 前后关系', questionBankId: 303, apiEndpoint: getApiEndpoint(303) },
  { jlptLevel: 'N3', tixing: '词汇', question: '問題 4 - 近义替换', questionBankId: 304, apiEndpoint: getApiEndpoint(304) },
  { jlptLevel: 'N3', tixing: '词汇', question: '問題 5 - 用法', questionBankId: 305, apiEndpoint: getApiEndpoint(305) },
  { jlptLevel: 'N3', tixing: '文法', question: '問題 6 - 语法形式的判断', questionBankId: 311, apiEndpoint: getApiEndpoint(311) },
  { jlptLevel: 'N3', tixing: '文法', question: '問題 7 - 句子的组织', questionBankId: 312, apiEndpoint: getApiEndpoint(312) },
  { jlptLevel: 'N3', tixing: '文法', question: '問題 8 - 文章语法', questionBankId: 313, apiEndpoint: getApiEndpoint(313) },
  { jlptLevel: 'N3', tixing: '読解', question: '問題 9 - 内容理解（短篇）', questionBankId: 321, apiEndpoint: getApiEndpoint(321) },
  { jlptLevel: 'N3', tixing: '読解', question: '問題 10 - 内容理解（中篇）', questionBankId: 322, apiEndpoint: getApiEndpoint(322) },
  { jlptLevel: 'N3', tixing: '読解', question: '問題 11 - 内容理解（长篇）', questionBankId: 323, apiEndpoint: getApiEndpoint(323) },
  { jlptLevel: 'N3', tixing: '読解', question: '問題 12 - 信息检索', questionBankId: 324, apiEndpoint: getApiEndpoint(324) },
  { jlptLevel: 'N3', tixing: '聴解', question: '問題 1 - 问题理解', questionBankId: 331, apiEndpoint: getApiEndpoint(331) },
  { jlptLevel: 'N3', tixing: '聴解', question: '問題 2 - 重点理解', questionBankId: 332, apiEndpoint: getApiEndpoint(332) },
  { jlptLevel: 'N3', tixing: '聴解', question: '問題 3 - 概要理解', questionBankId: 333, apiEndpoint: getApiEndpoint(333) },
  { jlptLevel: 'N3', tixing: '聴解', question: '問題 4 - 语言表达', questionBankId: 334, apiEndpoint: getApiEndpoint(334) },
  { jlptLevel: 'N3', tixing: '聴解', question: '問題 5 - 即时应答', questionBankId: 335, apiEndpoint: getApiEndpoint(335) },

  // N4
  { jlptLevel: 'N4', tixing: '词汇', question: '問題 1 - 汉字读法', questionBankId: 401, apiEndpoint: getApiEndpoint(401) },
  { jlptLevel: 'N4', tixing: '词汇', question: '問題 2 - 汉字书写', questionBankId: 402, apiEndpoint: getApiEndpoint(402) },
  { jlptLevel: 'N4', tixing: '词汇', question: '問題 3 - 前后关系', questionBankId: 403, apiEndpoint: getApiEndpoint(403) },
  { jlptLevel: 'N4', tixing: '词汇', question: '問題 4 - 近义替换', questionBankId: 404, apiEndpoint: getApiEndpoint(404) },
  { jlptLevel: 'N4', tixing: '词汇', question: '問題 5 - 用法', questionBankId: 405, apiEndpoint: getApiEndpoint(405) },
  { jlptLevel: 'N4', tixing: '文法', question: '問題 6 - 语法形式的判断', questionBankId: 411, apiEndpoint: getApiEndpoint(411) },
  { jlptLevel: 'N4', tixing: '文法', question: '問題 7 - 句子的组织', questionBankId: 412, apiEndpoint: getApiEndpoint(412) },
  { jlptLevel: 'N4', tixing: '文法', question: '問題 8 - 文章语法', questionBankId: 413, apiEndpoint: getApiEndpoint(413) },
  { jlptLevel: 'N4', tixing: '読解', question: '問題 9 - 内容理解（短篇）', questionBankId: 421, apiEndpoint: getApiEndpoint(421) },
  { jlptLevel: 'N4', tixing: '読解', question: '問題 10 - 内容理解（中篇）', questionBankId: 422, apiEndpoint: getApiEndpoint(422) },
  { jlptLevel: 'N4', tixing: '読解', question: '問題 11 - 信息检索', questionBankId: 423, apiEndpoint: getApiEndpoint(423) },
  { jlptLevel: 'N4', tixing: '聴解', question: '問題 1 - 问题理解', questionBankId: 431, apiEndpoint: getApiEndpoint(431) },
  { jlptLevel: 'N4', tixing: '聴解', question: '問題 2 - 重点理解', questionBankId: 432, apiEndpoint: getApiEndpoint(432) },
  { jlptLevel: 'N4', tixing: '聴解', question: '問題 3 - 语言表达', questionBankId: 433, apiEndpoint: getApiEndpoint(433) },
  { jlptLevel: 'N4', tixing: '聴解', question: '問題 4 - 即时应答', questionBankId: 434, apiEndpoint: getApiEndpoint(434) },

  // N5
  { jlptLevel: 'N5', tixing: '词汇', question: '問題 1 - 汉字读法', questionBankId: 501, apiEndpoint: getApiEndpoint(501) },
  { jlptLevel: 'N5', tixing: '词汇', question: '問題 2 - 汉字书写', questionBankId: 502, apiEndpoint: getApiEndpoint(502) },
  { jlptLevel: 'N5', tixing: '词汇', question: '問題 3 - 前后关系', questionBankId: 503, apiEndpoint: getApiEndpoint(503) },
  { jlptLevel: 'N5', tixing: '词汇', question: '問題 4 - 近义替换', questionBankId: 504, apiEndpoint: getApiEndpoint(504) },
  { jlptLevel: 'N5', tixing: '文法', question: '問題 5 - 语法形式的判断', questionBankId: 511, apiEndpoint: getApiEndpoint(511) },
  { jlptLevel: 'N5', tixing: '文法', question: '問題 6 - 句子的组织', questionBankId: 512, apiEndpoint: getApiEndpoint(512) },
  { jlptLevel: 'N5', tixing: '文法', question: '問題 7 - 文章语法', questionBankId: 513, apiEndpoint: getApiEndpoint(513) },
  { jlptLevel: 'N5', tixing: '読解', question: '問題 8 - 内容理解（短篇）', questionBankId: 521, apiEndpoint: getApiEndpoint(521) },
  { jlptLevel: 'N5', tixing: '読解', question: '問題 9 - 内容理解（中篇）', questionBankId: 522, apiEndpoint: getApiEndpoint(522) },
  { jlptLevel: 'N5', tixing: '読解', question: '問題 10 - 信息检索', questionBankId: 523, apiEndpoint: getApiEndpoint(523) },
  { jlptLevel: 'N5', tixing: '聴解', question: '問題 1 - 问题理解', questionBankId: 531, apiEndpoint: getApiEndpoint(531) },
  { jlptLevel: 'N5', tixing: '聴解', question: '問題 2 - 重点理解', questionBankId: 532, apiEndpoint: getApiEndpoint(532) },
  { jlptLevel: 'N5', tixing: '聴解', question: '問題 3 - 语言表达', questionBankId: 533, apiEndpoint: getApiEndpoint(533) },
  { jlptLevel: 'N5', tixing: '聴解', question: '問題 4 - 即时应答', questionBankId: 534, apiEndpoint: getApiEndpoint(534) }
]