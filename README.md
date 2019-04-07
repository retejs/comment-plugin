Rete comment plugin
====
#### Rete.js plugin

- Add inline comment: `Shift + C`
- Add frame comment: select nodes, `Shift + F`
- Delete comment: `Select comment and press Delete`
- Edit comment: `Call context menu`

```js
import CommentPlugin from 'rete-comment-plugin';

editor.use(CommentPlugin, { 
    margin: 20 // indent for new frame comments by default 30 (px)
})

editor.trigger('addcomment', ({ type: 'frame', text, nodes }))
editor.trigger('addcomment', ({ type: 'inline', text, position }))

editor.trigger('removecomment', { comment })
editor.trigger('removecomment', { type })
```