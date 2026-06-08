import { Router } from 'express'
import { Database } from '../types'
import { createGroupBuyController } from '../controllers/groupBuyController'

export const createGroupBuyRouter = (db: Database) => {
  const router = Router()
  const controller = createGroupBuyController(db)

  router.get('/', controller.getAllGroupBuys)
  router.get('/:id', controller.getGroupBuyById)
  router.post('/', controller.createGroupBuy)
  router.put('/:id/close', controller.closeGroupBuy)

  return router
}
