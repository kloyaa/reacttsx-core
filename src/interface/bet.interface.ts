export interface IBet {
    _id: string;
    type: string;
    time: string;
    amount: number;
    rambled: boolean;
    number: number;
    reference: string;
    profile: {
        firstName: string;
        lastName: string;
        birthdate: string;
        address: string;
        contactNumber: string;
        gender: string;
        verified: boolean;
    };
    schedule: string;
}

export interface IDailyResult {
    _id: string;
    number: string;
    schedule: string;
    type: string;
    time: string;
}