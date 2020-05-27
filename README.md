Rete comment plugin
====
#### Rete.js plugin

- Add inline comment: `Shift + C` (by default)
- Add frame comment: select nodes, `Shift + F` (by default)
- Delete comment: `Select comment and press Delete` (by default)
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

Edit comment using custom modal (instead of `prompt`)
```js
editor.use(CommentPlugin, { disableBuiltInEdit: true });

editor.on('editcomment', async (comment) => {
    comment.text = await openEditModal(comment.text);
    comment.update();
});
```

Add custom key bindings
```js
editor.use(CommentPlugin, {
    frameCommentKeys: { code: 'KeyF', shiftKey: true, ctrlKey: false, altKey: false },
    inlineCommentKeys: { code: 'KeyC', shiftKey: true, ctrlKey: false, altKey: false },
    deleteCommentKeys: { code: 'Delete', shiftKey: false, ctrlKey: false, altKey: false }
})
```