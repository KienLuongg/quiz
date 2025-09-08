import { ClassResponse } from "./class.model";
import { UserRequest, UserResponse } from "./user.model";

export interface StudentResponse {
    userResponse: UserResponse;
    rollPortal: string;
    rollNumber: string;
    classes: ClassResponse;
}

export interface StudentRequest {
    userRequest: UserRequest;
    rollPortal?: string;
    rollNumber?: string;
    classId: number;
}

export interface UpdateStudentClassRequest {
    userIds: number[];
    classId: number;
}