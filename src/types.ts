import { BaseSchemes, GetSchemes } from 'rete'

export type Position = { x: number, y: number }

export type ExpectedSchemes = GetSchemes<
  BaseSchemes['Node'] & { width: number, height: number },
  BaseSchemes['Connection']
>

export type MembershipState = { restoring: boolean }

export type CommentRestoreData = {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  links: string[]
  kind: 'inline' | 'frame'
}
