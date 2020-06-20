# Pita Chip API

NodeJS/Express API for Pita Chip webapps, mobile apps, and integrated services.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installations

#### Code Editor

I use VS Code. Love it for web development.

Install XCode

- Follow the instructions listed [here](https://developer.apple.com/xcode/)

Install Homebrew -- v2.4.0

- This will allow you to more easily install other packages
- Follow the instructions listed [here](https://brew.sh/)

Install NodeJS -- v13.8.0

```
$ brew install node
```

Install Mongodb

```
$ brew tap mongodb/brew
$ brew install mongodb-community@4.2
```

Start Mongodb as a Service

```
$ brew services start mongodb-community@4.2
$ mongo
```

- It should start running after the latest command

Install Mongodb Compass GUI

- This will allow you to view the database with a GUI
- Follow the instructions listed [here](https://www.mongodb.com/products/compass)

Install Postman -- v7.26.1

- Postman is the main tool that I use to test out the API
- Follow the instructions listed [here](https://www.postman.com/downloads/)

Install AWS CLI -- v2.0.24 && AWS ElasticBeanstalk (EB) CLI -- v3.18.1

- You might need this to make calls to some of our aws resources

```
brew update
brew install awscli
brew install awsebcli
```

- Make sure the following two commands work

```
aws --verison
eb --version
```

What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

- [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
- [Maven](https://maven.apache.org/) - Dependency Management
- [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Billie Thompson** - _Initial work_ - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
