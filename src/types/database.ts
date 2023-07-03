import { IUser } from "./user";

export interface IDatabase {
    getAllUsers: () => IUser[];
    getUserById (id: string): IUser;
    createUser (user: IUser): IUser;
    updateUser (user: Partial<IUser>, id: string): IUser | undefined;
    deleteUserById (id: string): void;
}
