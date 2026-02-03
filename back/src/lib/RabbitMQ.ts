import amqp, { Channel } from 'amqplib'
import { rabbitConfig } from '../config'

let channel: Channel | null = null

export async function getRabbitChannel(): Promise<Channel> {
  if (channel) return channel

  const connection = await amqp.connect(rabbitConfig.url)
  channel = await connection.createChannel()

  await channel.assertQueue(rabbitConfig.queueName, {
    durable: true
  })

  return channel
}
