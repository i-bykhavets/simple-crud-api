import url from 'node:url';
import { createServer } from "node:http";

import { IUser } from "../types/user";
import { IDatabase } from "../types/database";

class FakeDateBase {
    users: IUser[];

    constructor() {
        this.users = [];
    }

    setAllUsers(users: IUser[]) {
        this.users = users;
    }

    getAllUsers() {
        return this.users;
    }

    getUserById(id: string) {
        if (id.startsWith('\"') && id.endsWith('\"')) id = id.slice(1,-1);
        const user: IUser[] = this.users.filter((user) => user.id === id || user.id == `\"${id}\"`);
        return user[0] ?? null;
    }

    createUser(user: IUser) {
        this.users.push(user);
        return this.getUserById(user.id);
    }

    updateUser(user: Partial<IUser>, id: string) {
        if (id.startsWith('\"') && id.endsWith('\"')) id = id.slice(1,-1);
        const ourUser = this.users.find((user) => user.id === id);
        if (ourUser) {
            if (user.age) ourUser.age = user.age;
            if (user.username) ourUser.username = user.username;
            if (user.hobbies) ourUser.hobbies = user.hobbies;
        }
        return ourUser;
    }

    deleteUserById(id: string) {
        if (id.startsWith('\"') && id.endsWith('\"')) id = id.slice(1,-1);
        for (let i = 0; i < this.users.length; i += 1) {
            if (this.users[i].id === id) {
                this.users.splice(i, 1);
            }
        }
        return;
    }

}

export const fakeDB = new FakeDateBase();

export const fakeDBServer = createServer((req, res) => {
    switch(req.method) {
        case 'GET': {
            const users = fakeDB.getAllUsers();
            res.end(JSON.stringify(users));
            break;
        }

        case 'POST': {
            let data = '';
            req.on('data', chunk => {
                data += chunk;
            });
            req.on('end', () => {
                fakeDB.setAllUsers(JSON.parse(data));
            });
            res.end();
            break;
        }

        default:
            res.end(null);
    }
})
