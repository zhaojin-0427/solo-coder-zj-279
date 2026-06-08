import { Router } from 'express'
import { Database } from '../types'
import { createRecipeController } from '../controllers/recipeController'

export const createRecipeRouter = (db: Database) => {
  const router = Router()
  const controller = createRecipeController(db)

  router.get('/', controller.getAllRecipes)
  router.get('/:id', controller.getRecipeById)
  router.post('/', controller.createRecipe)
  router.delete('/:id', controller.deleteRecipe)

  return router
}
