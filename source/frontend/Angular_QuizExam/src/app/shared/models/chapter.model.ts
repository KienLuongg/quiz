import { SubjectResponse } from "./subject.model";

export interface ChapterResponse {
    id: number;
    name: string;
    status: number;
    subject: SubjectResponse;
}

export interface ChapterRequest {
    subjectId?: number;
    name?: string;
}