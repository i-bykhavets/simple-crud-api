import { createServer, request } from "node:http";
import url from 'url';
import uuid from 'node-uuid';

import * as errors from '../constants/errors';

import { isValidJSON } from "../utils/isValidJSON";

const endPoint = '/api/users';
const dbPort = Number(process.env.FAKE_DB_PORT) || 4080;
const ourPort = Number(process.env.WORKER_PORT) || 4000;

export const server = createServer((req, res) => {
    console.log(`Server received ${req.method} request`);


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
                        res.statusCode = 200;
                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                        res.end([]);
                    }  else if (!requestUrl.path?.startsWith(`${endPoint}/`)) {
                        res.statusCode = 404;
                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                        res.end(errors.RESOURCE_NOT_EXIST);
                    }
                    break;
                }

                case 'POST': {
                    break;
                }

                case 'PUT': {
                    break;
                }

                case 'DELETE': {
                    break;
                }
            }
        }
    } catch (error) {
        res.statusCode = 500;
        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
        res.end(errors.SERVER_ERROR);
    }
});
