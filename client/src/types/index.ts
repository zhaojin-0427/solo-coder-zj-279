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

export interface TimeSlot {
  id: number
  time: string
  capacity: number
  filled: number
}

export interface GroupBuy {
  id: number
  recipeId: number
  recipe?: Recipe
  title: string
  maxQuantity: number
  currentQuantity: number
  waitlistQuantity: number
  pickupTime: string
  productionDeadline: string
  dailyBatches: number
  allowWaitlist: boolean
  timeSlots: TimeSlot[]
  selectedTimeSlotId?: number
  paymentMethod: PaymentMethod
  status: 'active' | 'closed' | 'completed'
  unitPrice: number
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'pending_payment'
  | 'waitlisted'
  | 'to_produce'
  | 'pending_pickup'
  | 'completed'
  | 'cancelled'
  | 'expired'

export interface Order {
  id: number
  groupBuyId: number
  groupBuy?: GroupBuy
  userId: number
  userName: string
  phone: string
  quantity: number
  totalAmount: number
  status: OrderStatus
  waitlistPosition?: number
  promotedAt?: string
  pickedUpAt?: string
  timeSlotId?: number
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
  waitlistConversionRate: number
  onTimeDeliveryRate: number
  timeSlotFulfillmentRate: number
  recipeCapacityUtilization: { name: string; rate: number; utilized: number; capacity: number }[]
}

export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  role: 'admin' | 'user'
}
