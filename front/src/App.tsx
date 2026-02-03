import React, { useEffect, useRef, useState } from 'react'
import { Splitter, Table, TableColumnsType, InputNumber, Button } from 'antd'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { DataType } from './types'
import DragHandle from './components/DrageblRow/DrugHandle'
import Row from './components/DrageblRow/Row'
import { valueType } from 'antd/es/statistic/utils'
import { clearSearch, getPage, getSearch, moveId, moveSide, sendId } from './api'
import Search from 'antd/es/transfer/search'

export default function App() {
  const wrapRefLeft = useRef<HTMLDivElement | null>(null)
  const wrapRefRight = useRef<HTMLDivElement | null>(null)
  const leftSentinelRef = useRef<HTMLDivElement | null>(null)
  const rightSentinelRef = useRef<HTMLDivElement | null>(null)
  const [scrollerLeft, setScrollerLeft] = useState<HTMLElement>()
  const [scrollerRight, setScrollerRight] = useState<HTMLElement>()
  const [leftPage, setLeftPage] = useState<number>(1)
  const [rightPage, setRightPage] = useState<number>(1)
  const [leftSearch, setLeftSearch] = useState<string>('')
  const [rightSearch, setRightSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [leftDataSource, setLeftDataSource] = useState<DataType[]>([])
  const [rightDataSource, setRightDataSource] = useState<DataType[]>([])
  const [newItem, setNewItem] = useState<valueType | null>(null)

  const getColumns = (name: 'left' | 'right'): TableColumnsType<DataType> => [
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 20,
      render: (value, record, index) => {
        const dataSource = (name === 'left' ? leftDataSource : rightDataSource).filter(Boolean)
        const isLast = index === dataSource.filter(Boolean).length - 5
        return (
          <>
            <Button style={{ width: '15px', marginRight: '20px' }} onClick={() => select(record.index, name)}>
              {name === 'left' ? '>>' : '<<'}
            </Button>
            {name === 'left' ? '' : <DragHandle />}
            {isLast && <div ref={name === 'left' ? leftSentinelRef : rightSentinelRef} style={{ height: 1 }} id={name} />}
          </>
        )
      },
    },
    { title: 'Id', dataIndex: 'id', key: 'id', width: 200 },
  ]

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active && over && active.id !== over.id) {
      console.log(active.id)

      const activeIndex = rightDataSource.findIndex((record) => record.key === active.id)
      const overIndex = rightDataSource.findIndex((record) => record.key === over.id)
      setRightDataSource((prevState) => {
        prevState[activeIndex].index = overIndex
        prevState[overIndex].index = activeIndex
        return arrayMove(prevState, activeIndex, overIndex)
      })
      console.log(rightDataSource)

      await moveId({ from: Number(rightDataSource[activeIndex].id), to: Number(rightDataSource[overIndex].id), name: 'right' })
    }
  }

  const featchMoreData = async (name: 'left' | 'right', isSearch = false) => {
    const dataSource = name === 'left' ? leftDataSource : rightDataSource
    const setDataSource = name === 'left' ? setLeftDataSource : setRightDataSource
    const page = isSearch ? 1 : name === 'left' ? leftPage : rightPage
    const setPage = name === 'left' ? setLeftPage : setRightPage
    const search = name === 'left' ? leftSearch : rightSearch

    setIsLoading(true)
    const ids = await getPage(page, name, search)
    if (!ids) {
      setIsLoading(false)
      return
    }
    const data: DataType[] = []
    for (const key in ids) data.push({ ...ids[key], key: `${key}_${name}_${ids[key].index}` })
    if (isSearch) {
      name === 'right' ? setDataSource(data.sort((a, b) => a.index - b.index)) : setDataSource(data)
    } else {
      name === 'right' ? setDataSource([...dataSource, ...data].sort((a, b) => a.index - b.index)) : setDataSource([...dataSource, ...data])
    }
    setPage(() => page + 1)
    setIsLoading(false)
  }

  const sendNewItem = async () => {
    if (!newItem) return
    await sendId(Number(newItem))
  }

  const select = async (index: number, name: 'left' | 'right') => {
    moveSide(name, index)
    const from = name === 'left' ? setLeftDataSource : setRightDataSource
    const to = name === 'left' ? setRightDataSource : setLeftDataSource

    let selectData: DataType | undefined
    from((prevState) =>
      prevState.filter((data) => {
        if (data.index === index) selectData = data
        return data.index !== index
      })
    )
    if (selectData) to((prevState) => [...prevState, selectData!])
  }

  const onSearch = async (name: 'left' | 'right') => {
    setIsLoading(true)
    featchMoreData(name, true)
    setIsLoading(false)
  }

  useEffect(() => {
    for (const name of ['left', 'right'] as const) {
      featchMoreData(name)
      const root = name === 'left' ? wrapRefLeft.current : wrapRefRight.current
      const setScroller = name === 'left' ? setScrollerLeft : setScrollerRight
      if (!root) return
      const el = root.querySelector<HTMLElement>('.ant-table-body') ?? root.querySelector<HTMLElement>('.ant-table-content')
      if (el) setScroller(el)
    }
    return () => {
      clearSearch()
    }
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const name of ['left', 'right'] as const) {
      const sentinel = name === 'left' ? leftSentinelRef.current : rightSentinelRef.current
      const root = name === 'left' ? scrollerLeft : scrollerRight
      if (!root || !sentinel) return

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries.find((e) => e.isIntersecting)
          console.log(entry, entries)
          if (entry) featchMoreData(entry.target.id as 'left' | 'right')
        },
        { root, threshold: 0.1 }
      )

      observer.observe(sentinel)

      observers.push(observer)
    }
    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [scrollerLeft, scrollerRight, leftDataSource.length, rightDataSource.length])

  return (
    <Splitter style={{ verticalAlign: 'middle', height: '810px', marginTop: 'calc((100vh - 800px) / 2)' }}>
      <Splitter.Panel defaultSize="50%" resizable={false}>
        <div style={{ marginBottom: '16px', width: '30%', marginLeft: '35%', display: 'flex' }}>
          <Search onChange={(event) => setLeftSearch(event.target.value)} handleClear={() => setLeftSearch('')}></Search>
          <Button onClick={() => onSearch('left')} type="primary">
            Search
          </Button>
        </div>
        <div ref={wrapRefLeft}>
          <Table<DataType> components={{ body: { row: Row } }} columns={getColumns('left')} dataSource={leftDataSource} scroll={{ y: 55 * 9 }} pagination={false} loading={isLoading} />
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          Добавление новых элементов:
          <InputNumber onChange={setNewItem} style={{ margin: '10px' }} />
          <Button onClick={sendNewItem} type="primary">
            Send
          </Button>
        </div>
      </Splitter.Panel>

      <Splitter.Panel defaultSize="50%" resizable={false}>
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext items={rightDataSource.map((i) => i.index)} strategy={verticalListSortingStrategy}>
            <div style={{ marginBottom: '16px', width: '30%', marginLeft: '35%', display: 'flex' }}>
              <Search onChange={(event) => setRightSearch(event.target.value)} handleClear={() => setRightSearch('')}></Search>
              <Button onClick={() => onSearch('right')} type="primary">
                Search
              </Button>
            </div>
            <div ref={wrapRefRight}>
              <Table<DataType> components={{ body: { row: Row } }} columns={getColumns('right')} dataSource={rightDataSource} scroll={{ y: 55 * 10 }} pagination={false} loading={isLoading} />
            </div>
          </SortableContext>
        </DndContext>
      </Splitter.Panel>
    </Splitter>
  )
}
