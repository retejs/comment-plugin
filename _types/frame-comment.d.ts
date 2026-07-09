import { NodeEditor, NodeId } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import { Comment } from './comment';
import { ExpectedSchemes, Position } from './types';
export declare class FrameComment extends Comment {
    private editor;
    width: number;
    height: number;
    links: string[];
    constructor(text: string, area: BaseAreaPlugin<ExpectedSchemes, any>, editor: NodeEditor<ExpectedSchemes>, events?: {
        contextMenu?: (comment: FrameComment) => void;
        pick?: (comment: FrameComment) => void;
        translate?: (comment: FrameComment, dx: number, dy: number, sources?: NodeId[]) => Promise<void>;
        dragged?: (comment: FrameComment, previous: Position, prevLinks: string[]) => Promise<void>;
    }, options?: {
        id?: string;
    });
    private getRect;
    contains(nodeId: NodeId): boolean;
    intersects(nodeId: NodeId): boolean;
    linkTo(ids: string[]): void;
    resize(): Promise<void>;
    update(): void;
}
//# sourceMappingURL=frame-comment.d.ts.map