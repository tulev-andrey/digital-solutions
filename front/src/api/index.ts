import axios from 'axios'
import { DataType } from '../types'

const instance = axios.create({
  baseURL: `http://${import.meta.env.VITE_HOST}:3000`,
})

export async function sendId(id: number) {
  try {
    await instance.post('/', { data: id })
  } catch (error) {
    console.error(error)
  }
}

export async function getPage(page: number, name: 'left' | 'right', search: string, limit = 20) {
  try {
    if (page < 0) {
      console.error('page less than 0')
      return
    }
    const resp = await instance.get<DataType[]>('/page', { params: { page, name, search, limit } })
    return resp.data?.filter(Boolean)
  } catch (error) {
    console.error(error)
  }
}

export async function getSearch(name: 'left' | 'right', search: string, limit = 20) {
  try {
    const resp = await instance.get<DataType[]>('/search', { params: { name, search, limit } })
    return resp.data?.filter(Boolean)
  } catch (error) {
    console.error(error)
  }
}

export async function clearSearch() {
  try {
    await instance.get('/clearSearch')
  } catch (error) {
    console.error(error)
  }
}

export async function moveId(data: { from: number; to: number; name: 'right' }) {
  try {
    await instance.patch('/', data)
  } catch (error) {
    console.error(error)
  }
}

export async function moveSide(name: 'left' | 'right', index: number) {
  try {
    await instance.patch('/side', { from: name, index })
  } catch (error) {
    console.error(error)
  }
}
