import { useSortable } from '@dnd-kit/sortable'
import { RowContextProps, RowProps } from '../../types'
import React, { CSSProperties, useMemo } from 'react'
import { CSS } from '@dnd-kit/utilities'
import RowContext from './RowContext'

export default function Row(props: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: props['data-row-key'] })

  const style: CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  }

  const contextValue = useMemo<RowContextProps>(() => ({ setActivatorNodeRef, listeners }), [setActivatorNodeRef, listeners])

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  )
}
