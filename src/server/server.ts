import { createServer, request } from "node:http";
import url from 'url';
import uuid from 'node-uuid';

import { fakeDB } from "../database/fakeDateBase";
import { refreshDB } from '../database/refreshDB';

import * as errors from '../constants/errors';
import {IUser} from "../types/user";
import { isValidJSON } from "../utils/isValidJSON";

const endPoint = '/api/users';
const uuidRegEx = /[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const dbPort = Number(process.env.FAKE_DB_PORT) || 4080;
const ourPort = Number(process.env.WORKER_PORT) || 4000;

export const server = createServer((req, res) => {
    console.log(`Server received ${req.method} request on port ${ourPort}`);

    const dbGetOption = {
        port: dbPort,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const getRequestToDB = request(dbGetOption, (responseFromDB) => {
        let dataFromDB = '';
        responseFromDB.on('data', (chunk) => {
            dataFromDB += chunk;
        });
        responseFromDB.on('end', () => {
            let actualUsers = JSON.parse(dataFromDB);
            fakeDB.setAllUsers(actualUsers);

            try {
                const requestUrl = url.parse(req.url as string, true);

                if (!requestUrl?.path?.startsWith(endPoint)) {
                    res.statusCode = 404;
                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                    res.end(errors.RESOURCE_NOT_EXIST);
                } else {
                    switch (req.method) {
                        case 'GET': {
                            if (requestUrl.path === endPoint) {
                                const users: IUser[] = fakeDB.getAllUsers();
                                res.statusCode = 200;
                                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(users));
                            } else if (requestUrl.path?.startsWith(`${endPoint}/`)) {
                                const findUserId: string[] | null = requestUrl.path?.match(uuidRegEx);

                                if (findUserId == null) {
                                    res.statusCode = 400;
                                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                    res.end(errors.INVALID_UUID);
                                } else {
                                    const strFindId = JSON.stringify(findUserId[0]);
                                    const user = fakeDB.getUserById(strFindId);

                                    if (user === null) {
                                        res.statusCode = 404;
                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                        res.end(errors.NOT_FOUND);
                                    } else {
                                        res.statusCode = 200;
                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify(user));
                                    }
                                }
                            } else if (!requestUrl.path?.startsWith(`${endPoint}/`)) {
                                res.statusCode = 404;
                                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                res.end(errors.RESOURCE_NOT_EXIST);
                            }
                            break;
                        }

                        case 'POST': {
                            let data = '';
                            req.on('data', chunk => {
                                data += chunk;
                            });
                            req.on('end', () => {
                                if (!isValidJSON(data)) {
                                    res.statusCode = 400;
                                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                    res.end(errors.INVALID_JSON);
                                } else {
                                    try {
                                        const newUser: IUser = JSON.parse(data);
                                        if (!newUser.username || !newUser.age || !newUser.hobbies) {
                                            res.statusCode = 400;
                                            res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                            res.end(errors.INVALID_BODY);
                                        } else {
                                            if (requestUrl.path === endPoint || requestUrl.path === `${endPoint}/`) {
                                                newUser.id = uuid.v1();
                                                fakeDB.createUser(newUser);

                                                const allUsers = fakeDB.getAllUsers();
                                                const postData = JSON.stringify(allUsers);
                                                const dpPostOptions = {
                                                    port: dbPort,
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Content-Length': Buffer.byteLength(postData),
                                                    },
                                                };
                                                const postRequestToDB = request(dpPostOptions, (responseFromDB) => {
                                                    responseFromDB.on('data', (chunk) => {
                                                        console.log(`BODY: ${chunk}`);
                                                    });
                                                    responseFromDB.on('end', () => {
                                                        res.statusCode = 201;
                                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                        res.end(JSON.stringify(newUser));
                                                    });
                                                });
                                                postRequestToDB.write(postData);
                                                postRequestToDB.end();

                                            } else {
                                                res.statusCode = 400;
                                                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                res.end('URL is invalid');
                                            }
                                        }
                                    } catch (e) {
                                        res.statusCode = 500;
                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                        res.end(errors.SERVER_ERROR);
                                    }
                                }
                            });
                            break;
                        }

                        case 'PUT': {
                            let putData = '';
                            req.on('data', chunk => {
                                putData += chunk;
                            });
                            req.on('end', () => {
                                if (!isValidJSON(putData)) {
                                    res.statusCode = 400;
                                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                    res.end(errors.INVALID_JSON);
                                } else {
                                    try {
                                        const newUser: IUser = JSON.parse(putData);

                                        if (!newUser.username || !newUser.age || !newUser.hobbies) {
                                            res.statusCode = 400;
                                            res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                            res.end(errors.INVALID_BODY);
                                        } else {
                                            if (requestUrl.path?.startsWith(`${endPoint}/`)) {
                                                const findUserId = requestUrl.path?.match(uuidRegEx) as string[];

                                                if (findUserId == null) {
                                                    res.statusCode = 400;
                                                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                    res.end(errors.INVALID_UUID);
                                                } else {
                                                    const strFindId = JSON.stringify(findUserId[0]);
                                                    if (fakeDB.getAllUsers().length === 0) {
                                                        res.statusCode = 404;
                                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                        res.end(errors.NOT_FOUND);
                                                    } else {
                                                        const user = fakeDB.getUserById(strFindId);
                                                        if (user === null) {
                                                            res.statusCode = 404;
                                                            res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                            res.end(errors.NOT_FOUND);
                                                        } else {
                                                            const updatedUser = fakeDB.updateUser(newUser, strFindId);

                                                            refreshDB();

                                                            res.statusCode = 200;
                                                            res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                            res.end(JSON.stringify(updatedUser));
                                                        }
                                                    }
                                                }
                                            } else {
                                                res.statusCode = 400;
                                                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                res.end(errors.INVALID_URL);
                                            }
                                        }
                                    } catch (e) {
                                        res.statusCode = 500;
                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                        res.end(errors.SERVER_ERROR);
                                    }
                                }
                            });
                            break;
                        }

                        case 'DELETE': {
                            if (req.url?.startsWith(endPoint)) {
                                if (requestUrl.path === endPoint || requestUrl.path === `${endPoint}/`) {
                                    res.statusCode = 400;
                                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                    res.end(errors.INVALID_URL);
                                } else {
                                    const findUserId: string[] | null = requestUrl.path?.match(uuidRegEx);

                                    if (findUserId == null) {
                                        res.statusCode = 400;
                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                        res.end(errors.INVALID_UUID);
                                    } else {
                                        const strFindId = JSON.stringify(findUserId[0]);
                                        if (fakeDB.getAllUsers().length === 0) {
                                            res.statusCode = 404;
                                            res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                            res.end(errors.NOT_FOUND);
                                        } else {
                                            const user = fakeDB.getUserById(strFindId);
                                            if (user === null) {
                                                res.statusCode = 404;
                                                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                res.end(errors.NOT_FOUND);
                                            } else {
                                                fakeDB.deleteUserById(strFindId);

                                                const allUsers = fakeDB.getAllUsers();
                                                const postData = JSON.stringify(allUsers);
                                                const dbPostOptions = {
                                                    port: dbPort,
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Content-Length': Buffer.byteLength(postData),
                                                    },
                                                };
                                                const postRequestToDB = request(dbPostOptions, (responseFromDB) => {
                                                    responseFromDB.on('data', (chunk) => {
                                                        console.log(`BODY: ${chunk}`);
                                                    });
                                                    responseFromDB.on('end', () => {
                                                        res.statusCode = 204;
                                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                                        res.end();
                                                    });
                                                });
                                                postRequestToDB.write(postData);
                                                postRequestToDB.end();
                                            }
                                        }
                                    }
                                }
                            } else {
                                res.statusCode = 400;
                                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                res.end(errors.INVALID_URL);
                            }
                            break;
                        }
                    }
                }
            } catch (error) {
                res.statusCode = 500;
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(errors.SERVER_ERROR);
            }
        })
    })

    getRequestToDB.on('error', (e) => {
        console.error(e);
    });
    getRequestToDB.end();
});
