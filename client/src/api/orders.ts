import request from './index'
import type { Order, OrderStatus } from '@/types'

export interface CreateOrderDto {
  groupBuyId: number
  userName: string
  phone: string
  quantity: number
  timeSlotId?: number
}

export interface EligibilityResult {
  status: OrderStatus
  message: string
  canPlace: boolean
}

export interface CreateOrderResult {
  order: Order
  statusMessage: string
}

export interface UpdateStatusResult {
  order: Order
  promotedCount: number
  promotedOrders: Order[]
}

export const getOrders = () => {
  return request.get<any, Order[]>('/orders')
}

export const getOrder = (id: number) => {
  return request.get<any, Order>(`/orders/${id}`)
}

export const getOrdersByGroupBuy = (groupBuyId: number) => {
  return request.get<any, Order[]>(`/orders/group-buy/${groupBuyId}`)
}

export const checkOrderEligibility = (groupBuyId: number, quantity: number) => {
  return request.get<any, EligibilityResult>('/orders/eligibility', { params: { groupBuyId, quantity } })
}

export const createOrder = (data: CreateOrderDto) => {
  return request.post<any, CreateOrderResult>('/orders', data)
}

export const updateOrderStatus = (id: number, status: OrderStatus) => {
  return request.put<any, UpdateStatusResult>(`/orders/${id}/status`, { status })
}

export const markReadyForPickup = (id: number) => {
  return request.put<any, Order>(`/orders/${id}/ready-pickup`)
}

export const deleteOrder = (id: number) => {
  return request.delete<any, { message: string; promotedCount: number; promotedOrders: Order[] }>(`/orders/${id}`)
}
