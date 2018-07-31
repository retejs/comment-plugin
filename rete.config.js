import sass from 'rollup-plugin-sass';

export default {
    input: 'src/index.js',
    name: 'CommentPlugin',
    plugins: [
        sass({
            insert: true
        })
    ]
}