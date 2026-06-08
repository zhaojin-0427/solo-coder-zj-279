import request from './index'
import type { GroupBuy, PaymentMethod } from '@/types'

export interface CreateGroupBuyDto {
  recipeId: number
  title: string
  maxQuantity: number
  pickupTime: string
  paymentMethod: PaymentMethod
  unitPrice: number
}

export const getGroupBuys = () => {
  return request.get<any, GroupBuy[]>('/group-buys')
}

export const getGroupBuy = (id: number) => {
  return request.get<any, GroupBuy>(`/group-buys/${id}`)
}

export const createGroupBuy = (data: CreateGroupBuyDto) => {
  return request.post<any, GroupBuy>('/group-buys', data)
}

export const updateGroupBuy = (id: number, data: Partial<CreateGroupBuyDto>) => {
  return request.put<any, GroupBuy>(`/group-buys/${id}`, data)
}

export const closeGroupBuy = (id: number) => {
  return request.put<any, GroupBuy>(`/group-buys/${id}/close`)
}

export const deleteGroupBuy = (id: number) => {
  return request.delete<any, void>(`/group-buys/${id}`)
}
