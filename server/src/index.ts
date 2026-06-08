import express from 'express'
import cors from 'cors'
import { mockData } from './data/mockData'
import { Database } from './types'
import { createRecipeRouter } from './routes/recipes'
import { createGroupBuyRouter } from './routes/groupBuys'
import { createOrderRouter } from './routes/orders'
import { createReviewRouter } from './routes/reviews'
import { createStatisticsRouter } from './routes/statistics'

const app = express()
const PORT = 3000

const db: Database = JSON.parse(JSON.stringify(mockData))

app.use(cors())
app.use(express.json())

app.use('/api/recipes', createRecipeRouter(db))
app.use('/api/group-buys', createGroupBuyRouter(db))
app.use('/api/orders', createOrderRouter(db))
app.use('/api/reviews', createReviewRouter(db))
app.use('/api/statistics', createStatisticsRouter(db))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '手工烘焙食谱管理与社区接龙系统 API 运行正常' })
})

app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`)
  console.log(`📋 API 文档:`)
  console.log(`   GET    http://localhost:${PORT}/api/health`)
  console.log(`   GET    http://localhost:${PORT}/api/recipes`)
  console.log(`   GET    http://localhost:${PORT}/api/group-buys`)
  console.log(`   GET    http://localhost:${PORT}/api/orders`)
  console.log(`   GET    http://localhost:${PORT}/api/reviews`)
  console.log(`   GET    http://localhost:${PORT}/api/statistics`)
})
