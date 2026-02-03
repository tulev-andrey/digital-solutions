import { getRabbitChannel } from './lib/RabbitMQ'
import { rabbitConfig } from './config'
import { QueueMessage } from './types'
import { Message } from 'amqplib'
import { dbLeft } from './db'
import { isDuplicate } from './utils/deduplication'

let messages: Message[] = []

async function startConsumer() {
  const channel = await getRabbitChannel()

  channel.prefetch(rabbitConfig.prefetch)

  channel.consume(rabbitConfig.queueName, (msg) => {
    if (!msg) return
    messages.push(msg)
  })

  setInterval(async () => {
    if (messages.length === 0) return

    for (const msg of messages) {
      duple: try {
        const payload = JSON.parse(msg.content.toString()) as QueueMessage
        if (await isDuplicate(payload.id)) {
          console.log('Duplicate')
          break duple
        }
        const dbLenght = Object.keys(dbLeft).length
        dbLeft[dbLenght] = { id: payload.id, index: dbLenght }
      } catch (err) {
        console.error(err)
        channel.nack(msg)
        continue
      }
      channel.ack(msg)
    }

    messages = []
  }, rabbitConfig.batchIntervalMs)
}

startConsumer().catch(console.error)
