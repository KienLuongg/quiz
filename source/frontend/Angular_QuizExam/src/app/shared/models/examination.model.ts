import { MarkResponse } from "./mark.model";
import { QuestionRecordResponse } from "./question-record.model";
import { StudentResponse } from "./student.model";
import { SubjectResponse } from "./subject.model";

export interface ExaminationResponse {
    id: number;
    name: string;
    code: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    totalQuestion: number;
    maxScore: number;
    type: number;
    subject: SubjectResponse;
    markResponses: MarkResponse[];
    studentResponses: StudentResponse[];
    questionRecordResponses: QuestionRecordResponse[];
}

export interface ExaminationRequest {
    name: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    subjectId: number;
    type: number;
    levels: { [key: number]: number };
}