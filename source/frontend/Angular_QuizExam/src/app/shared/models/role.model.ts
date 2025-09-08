import { UserResponse } from "./user.model";

export interface Role {
    id: number;
    name: string;
    description: string;
    users?: UserResponse[];
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    roles: Role[];
}