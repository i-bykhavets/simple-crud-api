# Simple CRUD-API

### Task
[Assignment: CRUD API](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

### How to use

#### Download repository

    git clone https://github.com/i-bykhavets/simple-crud-api.git

#### Go to develop branch

    git checkout develop

#### Install dependencies

    npm install

### Run application

##### Run application in development mode

    npm run start:dev

##### Run application in production mode

    npm run start:prod

##### Run test scenarios for application

    npm test

##### Run multiple mode using clusters

    npm run start:multi

### API

- Get all the users

        GET api/users 

- Get user by **uuid**

        GET api/users/${userId} 

- Add new user

        POST api/users 

- Update user

        PUT api/users/${userId} 

- Delete user

        DELETE api/users/${userId}


### User DTO

    {
        username: string,
        age: number,
        hobbies: string[]
    }
