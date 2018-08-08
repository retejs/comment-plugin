import Draggable from './draggable';

export default class Comment {
    constructor(text) {
        this.text = text;
        this.el = this.initEl();
       
        this.scale = 1;
        this.x = 0;
        this.y = 0;
        this.dragPosition = [0, 0];
 
        new Draggable(this.el, this.onStart.bind(this), this.onTranslate.bind(this));
        this.update();
    }

    initEl() {
        let el = document.createElement('span');

        el.className = 'comment';
        el.tabIndex = 1;

        el.addEventListener('contextmenu', this.onClick.bind(this));
        el.addEventListener('focus', this.onFocus.bind(this));
        el.addEventListener('blur', this.onBlur.bind(this));

        return el;
    }

    k() {
        return 1;
    }

    onClick(e) {
        e.preventDefault();
        e.stopPropagation();

        let newText = prompt('Comment', this.text);

        if (newText) {
            this.text = newText
            this.update();
        }
    }

    onFocus() {
        this.scale = Math.max(1, 1 / this.k());
        this.update()
    }

    focused() {
        return document.activeElement === this.el;
    }

    onBlur() {
        this.scale = 1;
        this.update()
    }

    blur() {
        this.el.blur();
    }

    onStart() {
        this.dragPosition = [this.x, this.y];
    }

    onTranslate (dx, dy) {
        const [x, y] = this.dragPosition;

        this.x = x + this.scale * dx;
        this.y = y + this.scale * dy;
        
        this.update();
    }

    update() {
        this.el.innerText = this.text;
        this.el.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    }

    toJSON() {
        return {
            text: this.text,
            position: [ this.x, this.y ]
        }
    }
}