import Comment from './comment';
import { intersectRect } from './utils';

export default class InlineComment extends Comment {
    constructor(text, editor) {
        super(text);
        this.editor = editor;
        
        this.linked = null;
        this.el.className = 'inline-comment';
        this.el.addEventListener('mouseup', this.onDrag.bind(this));
    }

    linkTo(node) {
        this.linked = node;
    }

    linkedTo(node) {
        return this.linked === node;
    }

    onDrag() {
        const intersection = this.getIntersectNode();

        this.linkTo(intersection ? intersection.node : null);
    }

    getIntersectNode() {
        const commRect = this.el.getBoundingClientRect();

        return Array.from(this.editor.view.nodes)
            .map(([node, view]) => {
                return { node, rect: view.el.getBoundingClientRect() };
            })
            .find(({ rect }) => {
                return intersectRect(commRect, rect);
            });
    }

    offset(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.update();
    } 
}