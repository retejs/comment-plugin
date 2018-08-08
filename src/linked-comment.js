import Comment from './comment';
import Draggable from './draggable';
import { intersectRect } from './utils';

export default class LinkedComment extends Comment {
    constructor(text, editor) {
        super(text);
        this.editor = editor;
        
        this.linked = null;
        new Draggable(this.el, () => {}, () => {}, this.onDrag.bind(this));
    }

    linkTo(node) {
        this.linked = node;
    }

    linkedTo(node) {
        return this.linked === node;
    }

    onDrag() {
        const result = this.getIntersectNode();

        this.linkTo(result ? result.node : null);
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