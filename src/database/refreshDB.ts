import { request } from "node:http";

import { fakeDB } from "./fakeDateBase";

const dbPort = Number(process.env.FAKE_DB_PORT) || 4080;

export const refreshDB = () => {
    const allUsers = fakeDB.getAllUsers();
    const postData = JSON.stringify(allUsers);
    const postOptions = {
        port: dbPort,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };
    const postRequestToDB = request(postOptions);
    postRequestToDB.write(postData);
    postRequestToDB.end();
};
