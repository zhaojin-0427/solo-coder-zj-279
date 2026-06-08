import request from './index'
import type { Order } from '@/types'

export interface CreateOrderDto {
  groupBuyId: number
  userName: string
  phone: string
  quantity: number
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

export const createOrder = (data: CreateOrderDto) => {
  return request.post<any, Order>('/orders', data)
}

export const updateOrderStatus = (id: number, status: Order['status']) => {
  return request.put<any, Order>(`/orders/${id}/status`, { status })
}

export const deleteOrder = (id: number) => {
  return request.delete<any, void>(`/orders/${id}`)
}
