interface TeacherInfo {
  id: string
  name: string
  nameEn: string
  role: string
  image: string
  description: string
  expertise: string[]
  education: string[]
  experience: string[]
  languages: {
    language: string
    level: string
  }[]
}

export const teachers: TeacherInfo[] = [
   {
    id: 't3',
    name: '加奈',
    nameEn: 'Jia nai',
    role: '教务部主任',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/t3.jpg',
    description: '拥有10年以上日语教学经验，专注JLPT考试辅导，丰富的经验帮助学生快速提高考分。',
    expertise: ['JLPT考试辅导', '高考日语', '考研日语'],
    education: [
      '大连海事大学（211） 日语翻译硕士',
      'N1 专八 教师资格证 Catti2笔译'
    ],
    experience: [
      '日语学校讲师（2015年至今）',
      '教辅研发组长（2017年至今）'
    ],
    languages: [
      { language: '中文', level: '母语' },
      { language: '日语', level: 'N1 专八 Catti2笔译' },
      { language: '英语', level: 'CECT6' }
    ]
  },
  {
    id: 't4',
    name: '领领',
    nameEn: 'Ling ling',
    role: '新媒体授课主任',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/t4.jpg',
    description: '拥有10年以上日语教学经验，提供生动有趣的入门课程，帮助学员快速日语入门。',
    expertise: ['日常会话', '高考日语', '零基础入门'],
    education: [
      '西宁民族大学 日语系硕士',
      'N1 专八 教师资格证'
    ],
    experience: [
      '在线日语讲师（2012年至今）',
      '考研组长（2017年至今）'
    ],
    languages: [
      { language: '中文', level: '母语' },
      { language: '日语', level: 'N1 专八' },
      { language: '英语', level: 'CECT6' }
    ]
  },
  {
    id: 't1',
    name: '王语桥',
    nameEn: 'Wang Yuqiao',
    role: '高级日语讲师',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/t1.jpg',
    description: '拥有10年以上日语教学经验，专注JLPT考试辅导和发音指导。',
    expertise: ['JLPT考试辅导', '发音纠正', '商务日语'],
    education: [
      '日本岛根大学',
      '日语教育能力检定合格'
    ],
    experience: [
      '日语讲师（2011年至今）',
      '日语教辅编写（2015年至今）'
    ],
    languages: [
      { language: '中文', level: '母语' },
      { language: '日语', level: 'N1' },
      { language: '英语', level: '精通' }
    ]
  },
  {
    id: 't2',
    name: '凛音',
    nameEn: 'Lin nei',
    role: '高级日语讲师',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/t2.jpg',
    description: '擅长将复杂语法简单化，深受初学者欢迎。',
    expertise: ['日语语法', '初学者指导', '教材开发'],
    education: [
      '大连外国语大学 日语系本科',
      '日语教育能力检定合格'
    ],
    experience: [
      '日语学校讲师（2016年至今）',
      '日语教辅编写（2023年至今）'
    ],
    languages: [
      { language: '中文', level: '母语' },
      { language: '日语', level: 'N1' },
      { language: '英语', level: '精通' }
    ]
  }
 
]