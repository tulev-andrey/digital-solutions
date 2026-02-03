import { DataType, DbModel } from './types'
import { isDuplicate } from './utils/deduplication'

export const dbLeft: Record<number, DbModel | null> = {}
export const leftPages: DataType[] = []
export const dbRight: Record<number, DbModel | null> = {}
export const rightPages: DataType[] = []

const total = 1000000

export function getNumbers(name: string, page: number, search: string, count: number) {
  const entities: DbModel[] = []
  console.log({ name, page, search, count })
  for (let i = (page - 1) * count; i < total; i++) {
    if (i > total) return entities
    const db = name === 'left' ? dbLeft : dbRight
    if (db[i] === undefined && name === 'left') {
      db[i] = { id: i, index: i }
      isDuplicate(i)
    }
    if (!db[i]) continue
    if (search && !db[i]?.id.toString().includes(search)) continue
    entities.push(db[i]!)
    if (search && entities.length >= count * page) {
      return page > 1 ? entities.slice(count * (page - 1)) : entities
    }
    if (!search && entities.length >= count * page) return entities
  }
  return entities
}
