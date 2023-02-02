import { BaseSchemes, GetSchemes } from 'rete';

export type ExpectedSchemes = GetSchemes<BaseSchemes['Node'] & { width: number, height: number }, BaseSchemes['Connection']>
