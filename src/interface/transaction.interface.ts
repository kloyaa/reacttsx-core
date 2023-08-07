import { IUserProfile } from "./user.interface";

export interface ITransaction {
    _id: string;
    user: string;
    content: ITransactionItem[];
    schedule: string;
    time: string;
    total: number;
    reference: string;
    game: string;
    createdAt: string;
    updatedAt: string;
    profile: IUserProfile
    __v: number;
}

export interface ITransactionItem {
    type: string;
    time: string;
    rambled: boolean;
    amount: number;
    number: string;
    schedule: string;
}