import { Router } from 'express'
import { Database } from '../types'
import { createReviewController } from '../controllers/reviewController'

export const createReviewRouter = (db: Database) => {
  const router = Router()
  const controller = createReviewController(db)

  router.get('/', controller.getAllReviews)
  router.get('/user/:userId', controller.getReviewsByUser)
  router.post('/', controller.createReview)

  return router
}
