import { BaseSchemes, GetSchemes } from 'rete';
export declare type Position = {
    x: number;
    y: number;
};
export declare type ExpectedSchemes = GetSchemes<BaseSchemes['Node'] & {
    width: number;
    height: number;
}, BaseSchemes['Connection']>;
export declare type MembershipState = {
    restoring: boolean;
};
export declare type CommentRestoreData = {
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    links: string[];
    kind: 'inline' | 'frame';
};
//# sourceMappingURL=types.d.ts.map