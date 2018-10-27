import './style.sass';
import CommentManager from './manager';
import FrameComment from './frame-comment';
import InlineComment from './inline-comment';
import { nodesBBox } from './utils';

function install(editor, { margin = 30 }) {
    editor.bind('commentselected');
    editor.bind('commentcreated');
    editor.bind('commentremoved');

    const manager = new CommentManager(editor);

    window.addEventListener('keydown', function handleKey(e) {

        if (e.code === 'KeyF' && e.shiftKey) {
            const ids = editor.selected.list.map(node => node.id);
            const nodes = ids.map(id => editor.nodes.find(n => n.id === id));
            const { left, top, width, height } = nodesBBox(editor, nodes, margin);

            manager.addFrameComment('...', [ left, top ], ids, width, height);
        } else if (e.code === 'KeyC' && e.shiftKey) {
            const position = Object.values(editor.view.area.mouse);

            manager.addInlineComment('...', position);
        } else if (e.code === 'Delete') {
            manager.deleteFocusedComment();
        }
    });

    editor.on('nodetranslated', ({ node, prev }) => {
        const dx = node.position[0] - prev[0];
        const dy = node.position[1] - prev[1];

        manager.comments
            .filter(comment => comment instanceof InlineComment)
            .filter(comment => comment.linkedTo(node))
            .map(comment => comment.offset(dx, dy));
    });

    editor.on('nodedraged', node => {
        manager.comments
            .filter(comment => comment instanceof FrameComment)
            .filter(comment => {
                const contains = comment.isContains(node);
                const links = comment.links.filter(id => id !== node.id);

                comment.links = contains ? [...links, node.id] : links;
            });
    });

    editor.on('commentselected', () => {
        const list = [...editor.selected.list];

        editor.selected.clear();
        list.map(node => node.update ? node.update() : null);
    })

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