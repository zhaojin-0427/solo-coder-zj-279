import request from './index'
import type { Review, Order } from '@/types'

export interface CreateReviewDto {
  orderId: number
  userId: number
  userName: string
  rating: number
  content: string
}

export interface ReviewEligibility {
  eligible: boolean
  reason?: string
}

export const getReviews = () => {
  return request.get<any, Review[]>('/reviews')
}

export const getReview = (id: number) => {
  return request.get<any, Review>(`/reviews/${id}`)
}

export const getReviewsByUser = (userId: number) => {
  return request.get<any, Review[]>(`/reviews/user/${userId}`)
}

export const getEligibleOrdersForReview = (userId: number) => {
  return request.get<any, Order[]>('/reviews/eligible/:userId'.replace(':userId', String(userId)))
}

export const checkReviewEligibility = (orderId: number) => {
  return request.get<any, ReviewEligibility>(`/reviews/eligibility/${orderId}`)
}

export const createReview = (data: CreateReviewDto) => {
  return request.post<any, Review>('/reviews', data)
}

export const deleteReview = (id: number) => {
  return request.delete<any, void>(`/reviews/${id}`)
}
