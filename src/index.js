import './style.sass';
import Comment from './comment';

class CommentManager {
    constructor(editor) {
        this.editor = editor;
        this.comments = [];

        editor.on('zoomed', () => {
            this.comments.map(c => c.blur.call(c));
        });
    }

    addComment([x, y], text = '...') {
        let comment = new Comment(text);

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

    toJSON() {
        return this.comments.map(c => c.toJSON())
    }

    fromJSON(list) {
        this.comments.map(this.deleteComment);
        list.map(item => this.addComment(item.position, item.text));
    }
}

function install(editor, params) {
    const manager = new CommentManager(editor);

    window.addEventListener('keydown', function handleKey(e) {
        if (e.code === 'KeyC' && e.shiftKey) {
            let { mouse } = editor.view.area;

            manager.addComment(Object.values(mouse));
        } else if (e.code === 'Delete') {
            manager.deleteFocusedComment();
        }
    });

    editor.on('export', data => {
        data.comments = manager.toJSON();
    });

    editor.on('import', data => {
        manager.fromJSON(data.comments || []);
    });
}

export default {
    install
}