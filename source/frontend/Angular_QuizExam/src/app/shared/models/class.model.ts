export interface ClassResponse {
    id: number;
    name: string;
    classDay: string;
    classTime: string;
    admissionDate: Date;
    status: number;
}

export interface ClassRequest {
    name?: string;
    classDay?: string;
    classTime?: string;
    admissionDate?: Date;
}