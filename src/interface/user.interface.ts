export interface IUserProfile {
  user: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  address: string;
  contactNumber: string;
  gender: string;
  verified: boolean;
  refferedBy: string;
}

export interface IUserRole {
  _id: string;
  user: string;
  name: string;
  description: string;
  __v: number;
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
  profile: IUserProfile;
  role: IUserRole[];
  createdAt: Date;
}

export interface IActivity {
  _id: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  user: IUser,
  profile: IUserProfile;
}
