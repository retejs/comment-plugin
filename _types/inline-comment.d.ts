import { NodeId } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import { Comment } from './comment';
import { ExpectedSchemes, Position } from './types';
export declare class InlineComment extends Comment {
    width: number;
    height: number;
    constructor(text: string, area: BaseAreaPlugin<ExpectedSchemes, any>, events?: {
        contextMenu?: (comment: InlineComment) => void;
        pick?: (comment: InlineComment) => void;
        translate?: (comment: InlineComment, dx: number, dy: number, sources?: NodeId[]) => Promise<void>;
        dragged?: (comment: InlineComment, previous: Position, prevLinks: string[]) => Promise<void>;
    }, options?: {
        id?: string;
    });
    link(): void;
    getIntersectNode(): {
        id: string;
        rect: DOMRect;
    } | undefined;
    update(): void;
}
//# sourceMappingURL=inline-comment.d.ts.map