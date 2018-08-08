import './style.sass';
import CommentManager from './manager';

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

    editor.on('nodetranslated', ({ node, prev }) => {
        const dx = node.position[0] - prev[0];
        const dy = node.position[1] - prev[1];

        manager.offsetLinkedTo(node, dx, dy);
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