import { Database } from '../types'

export const mockData: Database = {
  users: [
    {
      id: 1,
      username: 'admin',
      nickname: '烘焙达人小美',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei',
      role: 'admin'
    },
    {
      id: 2,
      username: 'user1',
      nickname: '甜品师阿杰',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ajie',
      role: 'user'
    },
    {
      id: 3,
      username: 'user2',
      nickname: '面包爱好者小林',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaolin',
      role: 'user'
    }
  ],
  recipes: [
    {
      id: 1,
      name: '经典黄油曲奇',
      description: '入口即化的黄油曲奇，奶香浓郁，酥脆可口，是下午茶的完美搭档。',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
      ingredients: ['低筋面粉 200g', '黄油 130g', '细砂糖 50g', '糖粉 40g', '鸡蛋 1个', '香草精 少许'],
      steps: ['黄油室温软化，加糖打发', '分次加入蛋液打发均匀', '筛入面粉切拌均匀', '装入裱花袋挤出形状', '170度烤15分钟'],
      cost: 25,
      duration: 60,
      shelfLife: '7天',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: '软心巧克力蛋糕',
      description: '外酥内软的巧克力熔岩蛋糕，切开后浓郁的巧克力酱流出，让人无法抗拒。',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      ingredients: ['黑巧克力 150g', '黄油 100g', '鸡蛋 2个', '蛋黄 2个', '细砂糖 50g', '低筋面粉 30g'],
      steps: ['巧克力和黄油隔水融化', '鸡蛋加糖打发', '混合后筛入面粉', '倒入模具', '200度烤8分钟'],
      cost: 35,
      duration: 45,
      shelfLife: '当天',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: '日式抹茶红豆包',
      description: '松软的抹茶面包裹着绵密的红豆馅，茶香与豆香完美融合。',
      imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400',
      ingredients: ['高筋面粉 250g', '抹茶粉 10g', '细砂糖 40g', '酵母 3g', '牛奶 150ml', '红豆馅 200g'],
      steps: ['所有材料揉成面团', '发酵至两倍大', '分割包入红豆馅', '二次发酵', '180度烤20分钟'],
      cost: 20,
      duration: 180,
      shelfLife: '3天',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    },
    {
      id: 4,
      name: '法式马卡龙',
      description: '精致的法式甜点，外脆内软，口感层次丰富，少女心满满的粉粉颜色。',
      imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400',
      ingredients: ['杏仁粉 100g', '糖粉 100g', '蛋白 75g', '细砂糖 30g', '食用色素 少许'],
      steps: ['粉类过筛混合', '蛋白打发至硬性发泡', '翻拌均匀至缎带状', '挤出圆形晾皮', '150度烤15分钟'],
      cost: 40,
      duration: 90,
      shelfLife: '5天',
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z'
    },
    {
      id: 5,
      name: '提拉米苏',
      description: '经典意式甜点，咖啡与马斯卡彭的完美结合，入口即化，回味无穷。',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      ingredients: ['马斯卡彭奶酪 250g', '手指饼干 200g', '浓缩咖啡 200ml', '鸡蛋 3个', '细砂糖 80g', '可可粉 适量'],
      steps: ['蛋黄加糖打发', '加入马斯卡彭拌匀', '蛋白打发后混合', '手指饼干蘸咖啡铺层', '冷藏4小时撒可可粉'],
      cost: 55,
      duration: 120,
      shelfLife: '3天',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    },
    {
      id: 6,
      name: '芝士蛋糕',
      description: '浓郁绵密的重芝士蛋糕，芝士味十足，底部酥香，是芝士爱好者的最爱。',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd21536581?w=400',
      ingredients: ['奶油奶酪 300g', '消化饼干 100g', '黄油 50g', '淡奶油 150ml', '鸡蛋 2个', '细砂糖 80g'],
      steps: ['饼干压碎拌黄油做底', '奶酪加糖打顺滑', '加蛋和奶油拌匀', '倒入模具', '水浴法160度烤60分钟'],
      cost: 48,
      duration: 150,
      shelfLife: '4天',
      createdAt: '2024-01-06T00:00:00Z',
      updatedAt: '2024-01-06T00:00:00Z'
    }
  ],
  groupBuys: [
    {
      id: 1,
      recipeId: 1,
      title: '本周六黄油曲奇接龙',
      maxQuantity: 30,
      currentQuantity: 18,
      pickupTime: '2024-12-28T15:00:00',
      paymentMethod: 'wechat',
      status: 'active',
      unitPrice: 38,
      createdAt: '2024-12-20T10:00:00',
      updatedAt: '2024-12-20T10:00:00'
    },
    {
      id: 2,
      recipeId: 2,
      title: '圣诞限定巧克力蛋糕',
      maxQuantity: 20,
      currentQuantity: 20,
      pickupTime: '2024-12-25T10:00:00',
      paymentMethod: 'alipay',
      status: 'closed',
      unitPrice: 58,
      createdAt: '2024-12-18T10:00:00',
      updatedAt: '2024-12-18T10:00:00'
    },
    {
      id: 3,
      recipeId: 3,
      title: '周末抹茶红豆包',
      maxQuantity: 25,
      currentQuantity: 12,
      pickupTime: '2024-12-29T14:00:00',
      paymentMethod: 'cash',
      status: 'closed',
      unitPrice: 28,
      createdAt: '2024-12-15T10:00:00',
      updatedAt: '2024-12-15T10:00:00'
    },
    {
      id: 4,
      recipeId: 5,
      title: '新年提拉米苏团购',
      maxQuantity: 15,
      currentQuantity: 6,
      pickupTime: '2024-12-31T16:00:00',
      paymentMethod: 'wechat',
      status: 'active',
      unitPrice: 88,
      createdAt: '2024-12-22T10:00:00',
      updatedAt: '2024-12-22T10:00:00'
    }
  ],
  orders: [
    {
      id: 1001,
      groupBuyId: 1,
      userId: 2,
      userName: '小明',
      phone: '13800138001',
      quantity: 2,
      totalAmount: 76,
      status: 'completed',
      createdAt: '2024-12-20T12:00:00',
      updatedAt: '2024-12-20T12:00:00'
    },
    {
      id: 1002,
      groupBuyId: 1,
      userId: 3,
      userName: '小红',
      phone: '13800138002',
      quantity: 3,
      totalAmount: 114,
      status: 'paid',
      createdAt: '2024-12-21T09:30:00',
      updatedAt: '2024-12-21T09:30:00'
    },
    {
      id: 1003,
      groupBuyId: 2,
      userId: 1,
      userName: '小刚',
      phone: '13800138003',
      quantity: 1,
      totalAmount: 58,
      status: 'pending',
      createdAt: '2024-12-22T14:20:00',
      updatedAt: '2024-12-22T14:20:00'
    },
    {
      id: 1004,
      groupBuyId: 1,
      userId: 2,
      userName: '小美',
      phone: '13800138004',
      quantity: 5,
      totalAmount: 190,
      status: 'completed',
      createdAt: '2024-12-22T16:45:00',
      updatedAt: '2024-12-22T16:45:00'
    },
    {
      id: 1005,
      groupBuyId: 3,
      userId: 3,
      userName: '小李',
      phone: '13800138005',
      quantity: 4,
      totalAmount: 112,
      status: 'cancelled',
      createdAt: '2024-12-16T11:00:00',
      updatedAt: '2024-12-16T11:00:00'
    },
    {
      id: 1006,
      groupBuyId: 2,
      userId: 2,
      userName: '阿华',
      phone: '13800138006',
      quantity: 2,
      totalAmount: 116,
      status: 'completed',
      createdAt: '2024-12-19T10:00:00',
      updatedAt: '2024-12-19T10:00:00'
    }
  ],
  reviews: [
    {
      id: 1,
      orderId: 1001,
      userId: 2,
      userName: '小明',
      rating: 5,
      content: '黄油曲奇太好吃了！奶香浓郁，酥脆可口，下次还会买！',
      createdAt: '2024-12-25T18:00:00'
    },
    {
      id: 2,
      orderId: 1004,
      userId: 2,
      userName: '小美',
      rating: 4,
      content: '曲奇很美味，包装也很精美，就是稍微有点甜了。',
      createdAt: '2024-12-26T10:30:00'
    },
    {
      id: 3,
      orderId: 1006,
      userId: 2,
      userName: '阿华',
      rating: 5,
      content: '巧克力熔岩蛋糕绝了！切开流心的那一刻太惊喜了，强烈推荐！',
      createdAt: '2024-12-26T15:00:00'
    }
  ]
}
