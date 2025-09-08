export interface AnswerRecordResponse {
    id: number;
    content: string;
}

export interface QuestionRecordResponse {
    id: number;
    content: string;
    image: string;
    type: number;
    answerRecords: AnswerRecordResponse[];
}