import { ReteOptions } from 'rete-cli'
import sass from 'rollup-plugin-sass'

export default <ReteOptions>{
    input: 'src/index.ts',
    name: 'CommentPlugin',
    globals: {
        'rete': 'Rete',
        'rete-area-plugin': 'AreaPlugin'
    },
    plugins: [
        sass({
            insert: true
        })
    ]
}
