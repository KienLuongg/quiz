export interface LevelResponse {
    id: number;
    name: string;
    point: number;
    status: number;
}

export interface LevelRequest {
    name?: string;
    point?: number;
}