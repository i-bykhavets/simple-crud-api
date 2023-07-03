export const SERVER_ERROR = JSON.stringify({
    message: `Sorry, Errors on the server side occur during the processing of your request.`
});

export const INVALID_URL = JSON.stringify({
    message: 'URL is invalid'
});

export const INVALID_UUID = JSON.stringify({
    message: 'User UUID is invalid'
});

export const INVALID_BODY = JSON.stringify({
    message: 'Request body does not contain required fields'
});

export const INVALID_JSON = JSON.stringify({
    message: 'JSON is invalid. Please, correct body data'
});

export const RESOURCE_NOT_EXIST = JSON.stringify({
    message: `Requested resource doesn\'t exist. Please, correct url`
});

export const NOT_FOUND = JSON.stringify({
    message: 'Record with this userId doesn\'t exist'
});
