import { BaseSchemes, GetSchemes } from 'rete'

export type Position = { x: number, y: number }

export type ExpectedSchemes = GetSchemes<BaseSchemes['Node'] & { width: number, height: number }, BaseSchemes['Connection']>
