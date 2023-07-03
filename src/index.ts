import * as dotenv from 'dotenv';
import { createServer, request } from "node:http";

import { server } from './server/server';

import * as errors from './constants/errors';

dotenv.config();

process.on('uncaughtException',  (error) => {
    console.log(error);
});

process.on('SIGINT', () => {
    setImmediate(() => process.exit(0));
});

const host = 'localhost';
let port = Number(process.env.PORT) || 4000;
const dbPort = Number(process.env.FAKE_DB_PORT) || 4080;
const args = process.argv;

server.listen(port, () => {
    console.log(`Server is running at PORT ${port}`);
});
