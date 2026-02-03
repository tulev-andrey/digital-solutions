import express, { Request, Response } from 'express'
import { getRabbitChannel } from './lib/RabbitMQ'
import { rabbitConfig } from './config'
import { QueueMessage } from './types'
import { dbLeft, dbRight, getNumbers, leftPages } from './db'
import cors from 'cors'

export function createApp() {
  const app = express()
  app.use(express.json())
  app.use(cors())

  app.get('/clearSearch', (req: Request, res: Response) => {
    leftPages.length = 0
  })

  app.get('/page', (req: Request, res: Response) => {
    const page: number = Number(req.query?.page),
      name: string = req.query?.name?.toString() || '',
      search: string = req.query?.search?.toString() || '',
      limit: number = Number(req.query?.limit || 20)

    if (!name) return

    res.json(getNumbers(name, page, search, limit))
  })

  app.post('/', async (req: Request, res: Response) => {
    const channel = await getRabbitChannel()

    if (!req.body?.data || typeof req.body.data !== 'number') {
      return res.status(400).json({ error: 'Wrong data' })
    }

    const message: QueueMessage = { id: req.body.data }

    channel.sendToQueue(rabbitConfig.queueName, Buffer.from(JSON.stringify(message)))

    res.json({ status: 'ok' })
  })

  app.patch('/', async (req: Request, res: Response) => {
    const { from, to, name } = req.body

    if (!from || !to || !name) {
      res.json({ status: 'error' })
      return
    }

    if (typeof from !== 'number' || typeof to !== 'number' || from < 0 || to < 0) {
      return res.status(400).json({ error: 'Wrong from or to' })
    }

    if (name === 'left') {
      if (!dbLeft[from] || !dbLeft[to]) return res.json({ status: 'void db plase' })
      const indexFrom = dbLeft[from]?.index
      const indexTo = dbLeft[to]?.index
      ;((dbLeft[from].index = indexTo), (dbLeft[to].index = indexFrom))
    } else if (name === 'right') {
      if (!dbRight[from] || !dbRight[to]) return res.json({ status: 'void db plase' })
      const indexFrom = dbRight[from]?.index
      const indexTo = dbRight[to]?.index
      ;((dbRight[from].index = indexTo), (dbRight[to].index = indexFrom))
    }

    res.json({ status: 'ok' })
  })

  app.patch('/side', async (req: Request, res: Response) => {
    const { from, index } = req.body

    if (!from || Number.isNaN(Number(index))) {
      res.json({ status: 'error' })
      return
    }

    const dbLength = Object.keys(from === 'left' ? dbRight : dbLeft).length

    if (from === 'left' && dbLeft[index] !== null) {
      dbRight[index] = { ...dbLeft[index], index: dbLength }
      dbLeft[index] = null
    } else if (from === 'right' && dbRight[index] !== null) {
      dbLeft[index] = { ...dbRight[index], index }
      dbRight[index] = null
    }

    res.json({ status: 'ok' })
  })

  app.get('/', async (req: Request, res: Response) => res.json({ status: 'ok' }))
  return app
}
