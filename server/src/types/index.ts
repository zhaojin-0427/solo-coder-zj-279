export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  role: 'admin' | 'user'
}

export interface Recipe {
  id: number
  name: string
  description: string
  imageUrl: string
  ingredients: string[]
  steps: string[]
  cost: number
  duration: number
  shelfLife: string
  createdAt: string
  updatedAt: string
}

export type PaymentMethod = 'wechat' | 'alipay' | 'cash' | 'bank_transfer'

export interface GroupBuy {
  id: number
  recipeId: number
  recipe?: Recipe
  title: string
  maxQuantity: number
  currentQuantity: number
  pickupTime: string
  paymentMethod: PaymentMethod
  status: 'active' | 'closed' | 'completed'
  unitPrice: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: number
  groupBuyId: number
  groupBuy?: GroupBuy
  userId: number
  userName: string
  phone: string
  quantity: number
  totalAmount: number
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: number
  orderId: number
  order?: Order
  userId: number
  userName: string
  rating: number
  content: string
  createdAt: string
}

export interface Statistics {
  popularity: { name: string; value: number }[]
  transactionRate: { name: string; value: number }[]
  durationTrend: { date: string; duration: number }[]
  repurchaseRate: number
  totalRecipes: number
  totalGroupBuys: number
  totalOrders: number
  totalRevenue: number
}

export interface Database {
  users: User[]
  recipes: Recipe[]
  groupBuys: GroupBuy[]
  orders: Order[]
  reviews: Review[]
}

export interface CreateRecipeDto {
  name: string
  description: string
  imageUrl: string
  ingredients: string[]
  steps: string[]
  cost: number
  duration: number
  shelfLife: string
}

export interface CreateGroupBuyDto {
  recipeId: number
  title: string
  maxQuantity: number
  pickupTime: string
  paymentMethod: PaymentMethod
  unitPrice: number
}

export interface CreateOrderDto {
  groupBuyId: number
  userName: string
  phone: string
  quantity: number
}

export interface CreateReviewDto {
  orderId: number
  userId: number
  userName: string
  rating: number
  content: string
}
