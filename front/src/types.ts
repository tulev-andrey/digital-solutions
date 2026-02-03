import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

export interface DataType {
  key: React.Key
  index: number
  id: number
}

export interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

export interface RowContextProps extends React.HTMLAttributes<HTMLTableRowElement> {
  setActivatorNodeRef?: (element: HTMLElement | null) => void
  listeners?: SyntheticListenerMap
}
