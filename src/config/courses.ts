interface Course {
  id: string
  title: string
  level: string
  type: string
  image: string
  lessons: number
  duration: string
  rating: number
  students: number
  price: number
  tag?: 'popular' | 'new'
  description: string
}

export const courses: Course[] = [
  {
    id: 'n3-grammar',
    title: 'JLPT N3 语法精讲课',
    level: 'N3',
    type: '语法',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/n3yfk.png',
    lessons: 33,
    duration: '15小时',
    rating: 5.0,
    students: 139,
    price: 99,
    tag: 'popular',
    description: '永久学习视频、名师答疑、赠纯刷App VIP权限'
  },
  {
    id: 'n1-jlpt',
    title: '历年JLPTN1真题讲解备战N1考试必学课',
    level: 'N1',
    type: 'JLPT',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/n1ztk.png',
    lessons: 62,
    duration: '31',
    rating: 4.9,
    students: 257,
    price: 199,
    description: '永久学习视频、名师答疑、赠纯刷App VIP权限'
  },
  {
     id: 'n2-jlpt',
    title: '历年JLPTN2真题讲解备战N2考试必学课',
    level: 'N2',
    type: 'JLPT',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/n2ztk.png',
    lessons: 50,
    duration: '25',
    rating: 4.9,
    students: 468,
    price: 159,
    description: '永久学习视频、名师答疑、赠纯刷App VIP权限'
  },
  {
    id: 'n3-jlpt',
    title: '历年JLPTN3真题讲解备战N3考试必学课',
    level: 'N3',
    type: 'JLPT',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/n3ztk.png',
    lessons: 38,
    duration: '18',
    rating: 4.9,
    students: 526,
    price: 119,
    description: '历年JLPT N3真题讲解，备战N3考试必学课程'
  },
  {
    id: 'dz-jlpt',
    title: 'JLPT考前抢分1对1直播课',
    level: 'JLPT',
    type: 'JLPT',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/1v1zbk.png',
    lessons: 24,
    duration: '12',
    rating: 4.9,
    students: 16,
    price: 2200,
    tag: 'new',
    description: '1对1直播课 针对薄弱处订制学习内容'
  }
]