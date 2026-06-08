import { Router } from 'express'
import { Database } from '../types'
import { createStatisticsController } from '../controllers/statisticsController'

export const createStatisticsRouter = (db: Database) => {
  const router = Router()
  const controller = createStatisticsController(db)

  router.get('/', controller.getStatistics)

  return router
}
