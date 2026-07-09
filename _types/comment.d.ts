import { NodeId } from 'rete';
import { BaseAreaPlugin, Drag } from 'rete-area-plugin';
import { ExpectedSchemes, Position } from './types';
export declare class Comment {
    text: string;
    area: BaseAreaPlugin<ExpectedSchemes, any>;
    private events?;
    id: string;
    dragHandler: Drag;
    x: number;
    y: number;
    width: number;
    height: number;
    links: string[];
    element: HTMLElement;
    nested: HTMLElement;
    prevPosition: null | Position;
    private dragOrigin;
    constructor(text: string, area: BaseAreaPlugin<ExpectedSchemes, any>, events?: {
        contextMenu?: (() => void) | null | undefined;
        pick?: (() => void) | null | undefined;
        translate?: ((dx: number, dy: number, sources?: NodeId[]) => Promise<void>) | null | undefined;
        drag?: (() => void) | null | undefined;
        dragged?: ((previous: Position, prevLinks: string[]) => Promise<void>) | null | undefined;
    } | undefined, options?: {
        id?: string;
    });
    linkTo(ids: NodeId[]): void;
    linkedTo(nodeId: NodeId): boolean;
    onContextMenu(e: MouseEvent): void;
    translate(dx: number, dy: number, sources?: NodeId[]): Promise<void>;
    select(): void;
    unselect(): void;
    update(): void;
    destroy(): void;
    private finishDrag;
}
//# sourceMappingURL=comment.d.ts.map