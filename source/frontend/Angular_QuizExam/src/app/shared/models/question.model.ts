import { ChapterResponse } from "./chapter.model";
import { LevelResponse } from "./level.model";
import { SubjectResponse } from "./subject.model";

export interface AnswerResponse {
    id: number;
    content: string;
    isCorrect: boolean;
}

export interface QuestionResponse {
    id: number;
    content: string;
    image: string;
    subject: SubjectResponse;
    chapters: ChapterResponse[];
    level: LevelResponse;
    answers: AnswerResponse[];
}

export interface AnswerRequest {
    content: string;
    isCorrect: boolean;
}
  
export interface QuestionRequest {
    subjectId: number;
    chapters: number[];
    levelId: number;
    content: string;
    answers: AnswerRequest[];
    image?: string;
    file?: File | null;
}