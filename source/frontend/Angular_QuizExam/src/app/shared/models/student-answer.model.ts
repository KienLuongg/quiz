export interface StudentQuestionAnswer {
    questionRecordId: number;
    selectedAnswerIds: number[];
}

export interface StudentAnswerRequest {
    markId?: number;
    studentQuestionAnswers?: StudentQuestionAnswer[];
}