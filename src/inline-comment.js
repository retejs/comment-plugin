import Comment from './comment';
import { intersectRect } from './utils';

export default class InlineComment extends Comment {
    constructor(text, editor) {
        super(text);
        this.editor = editor;
        
        this.link = null;
        this.el.className = 'inline-comment';
        this.el.addEventListener('mouseup', this.onDrag.bind(this));
    }

    linkTo(id) {
        this.link = id;
    }

    linkedTo(node) {
        return this.link === node.id;
    }

    onDrag() {
        const intersection = this.getIntersectNode();

        this.linkTo(intersection ? intersection.node.id : null);
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

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'inline',
            link: this.link
        }
    }
}