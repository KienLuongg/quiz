import { StudentResponse } from "./student.model";

export interface MarkResponse {
    id: number;
    beginTime: Date;
    submittedTime: Date;
    score: number;
    maxScore: number;
    warning: number;
    subjectName: string;
    studentResponse: StudentResponse;
}

export interface PassPercentage {
    passRate: number;
    subjectName: string;
}