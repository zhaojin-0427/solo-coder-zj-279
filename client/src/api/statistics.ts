import request from './index'
import type { Statistics } from '@/types'

export const getStatistics = () => {
  return request.get<any, Statistics>('/statistics')
}
