import LinkedComment from './linked-comment';

export default class CommentManager {
    constructor(editor) {
        this.editor = editor;
        this.comments = [];

        editor.on('zoomed', () => {
            this.comments.map(c => c.blur.call(c));
        });
    }

    addComment([x, y], text = '...') {
        let comment = new LinkedComment(text, this.editor);

        comment.k = () => this.editor.view.area.transform.k;
        comment.x = x;
        comment.y = y;
        comment.update();
        this.comments.push(comment);
        this.editor.view.area.appendChild(comment.el);
    }

    deleteComment(comment) {
        this.editor.view.area.removeChild(comment.el);
        this.comments.splice(this.comments.indexOf(comment), 1);
    }

    deleteFocusedComment() {
        const focused = this.comments.find(c => c.focused());
        
        if (focused)
            this.deleteComment(focused)
    }

    offsetLinkedTo(node, dx, dy) {
        this.comments
            .filter(comment => comment.linkedTo(node))
            .map(comment => comment.offset(dx, dy));
    }

    toJSON() {
        return this.comments.map(c => c.toJSON())
    }

    fromJSON(list) {
        this.comments.map(this.deleteComment);
        list.map(item => this.addComment(item.position, item.text));
    }
}