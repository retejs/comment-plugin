/* eslint-disable @typescript-eslint/naming-convention */
import { ReteOptions } from 'rete-cli'
import sass from 'rollup-plugin-sass'

export default <ReteOptions>{
  input: 'src/index.ts',
  name: 'ReteCommentPlugin',
  globals: {
    'rete': 'Rete',
    'rete-area-plugin': 'ReteAreaPlugin'
  },
  plugins: [
    sass({
      insert: true
    })
  ]
}
