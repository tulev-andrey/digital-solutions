import { HolderOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React from 'react'
import { useContext } from 'react'
import RowContext from './RowContext'

export default function DragHandle() {
  const { setActivatorNodeRef, listeners } = useContext(RowContext)
  return <Button type="text" size="small" icon={<HolderOutlined />} style={{ cursor: 'move' }} ref={setActivatorNodeRef} {...listeners} />
}
