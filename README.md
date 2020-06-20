# Pita Chip API

NodeJS/Express API for Pita Chip webapps, mobile apps, and integrated services.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Local Machine Dependencies

#### Code Editor

I use VS Code. Love it for web development.

#### Install XCode

- Follow the instructions listed [here](https://developer.apple.com/xcode/)

#### Install Homebrew -- v2.4.0

- This will allow you to more easily install other packages
- Follow the instructions listed [here](https://brew.sh/)

```
$ brew --version
Homebrew 2.4.0
```

#### Install NodeJS -- v13.8.0

```
$ brew install node
$ node -v
v13.8.0
```

#### Install Mongodb

```
$ brew tap mongodb/brew
$ brew install mongodb-community@4.2
$ mongo --version
MongoDB shell version v4.2.6
```

#### Start Mongodb as a Service

```
$ brew services start mongodb-community@4.2
$ mongo
```

It should start running after the latest command

#### Install Mongodb Compass GUI

- This will allow you to view the database with a GUI
- Follow the instructions listed [here](https://www.mongodb.com/products/compass)

#### Install Postman -- v7.26.1

- Postman is the main tool that I use to test out the API
- Follow the instructions listed [here](https://www.postman.com/downloads/)

#### Install AWS CLI -- v2.0.24 && AWS ElasticBeanstalk (EB) CLI -- v3.18.1

- You might need this to make calls to some of our aws resources

```
$ brew update
$ brew install awscli
$ brew install awsebcli
```

- Make sure the following two commands work

```
$ aws --verison
$ eb --version
```

#### Install nodemon

- Nodemon helps us keep the server running and restarting on changes

```
$ npm install -g nodemon
```

### Project Installation

#### Clone Project

- Clone the project and change to the current branch _v1.2.0_

```
$ git clone https://github.com/pitachip/API.git
$ git checkout v1.2.0
$ git branch
v1.2.0
```

#### Get NPM packages

```
$ npm install
```

#### Configure Mongodb

- Using the Compass GUI, connect to the local mongodb
- Get the URI (connection string) to be used in the next step

#### Configure Credentials

- I will give you all config files needed. All are to be placed in the /config folder.
- Make sure to replace the following credentials variable in the config.local.env file

```
MONGO_URI
```

#### Seed or delete the localdb data

```
$ npm run seed-local
Data imported
```

```
$ npm run delete-seed-local
Data deleted
```

#### Start Project Locally

```
$ npm run local
Server running in localhost on port 5000
Firebase connected: [Default]
MongoDB Connected: localhost
```

### Import API Endpoint Collection

- Use this endpoint collection and import it into Postman
- You can find this in the Pita Chip dropbox in the [Dropbox Tech Folder](https://www.dropbox.com/sh/lsb35bhx6m7yjxb/AACmBHhMBYyYfp3GC1htts1Oa?dl=0)

### Documentaion

- Docs related to the requirements, design, etc are located in the [Dropbox Tech Folder](https://www.dropbox.com/sh/lsb35bhx6m7yjxb/AACmBHhMBYyYfp3GC1htts1Oa?dl=0)
- TODO: API Docs
