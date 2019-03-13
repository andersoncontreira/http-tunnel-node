# HTTP Tunnel 
This project provide an HTTP tunnel connection.
The project contains an serve:r that can receive HTTP connections and delivery to the target desired, but with IP from the current
host (Whitelist host).

<!-- badges -->
[![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](LICENSE) 
[![Build Status](https://travis-ci.org/andersoncontreira/http-tunnel-node.svg?branch=master)](https://travis-ci.org/andersoncontreira/http-tunnel-node)
[![codecov](https://codecov.io/gh/andersoncontreira/http-tunnel-node/branch/master/graph/badge.svg)](https://codecov.io/gh/andersoncontreira/http-tunnel-node)
<!-- -->

## Purpose
Some API services work with an Ips whitelist, during the development process is necessary connect to this API.
The idea of this project is provide the way to the connection of one local server connect to the API by a HTTP tunnel, in this case, is a host with the able IP.

Example: 
local_host => whitelist_host => server_host.  
 
 
## Limitations
For while HTTPS request are not supported yet.

## Last updates 
In this section contains the release notes of the project.

> Version 1.8.0

Bootstrap security problem are solved.
* CVE-2019-8331;
* CVE-2018-20677;
* Others;
The last version 3.3.7 are changed to the version (>=3.4.1):


> Version 1.7.2

Initial version of the project

All the changes must be tracked in [CHANGELOG.md](CHANGELOG.md)

## Prerequisites
* node: 6.10+


### Production:
* express: ~4.14.1
* http-http-client: 1.0.2
* http-https-client: 1.2.0
* forever-monitor: 1.7.1
* bootstrap: >=3.4.1
* moment: ^2.18.1
* others

### Development:
* chai: ^3.5.0
* mocha: ^2.3.1

## Features
* HTTP tunnel for request

## Installation

The first step is the installation of [Node.js](https://nodejs.org/en/), even though it is not installed.
The installation is done using the command `npm`  

``` 
npm install 
``` 
The Development dependencies can be installed by this command:
``` 
npm install --only=dev
``` 

## Getting started
### Running locally for testing and development

This application are build for Aws Lambda functions, but to run locally this application uses the `express` module.
To run the application locally you need execute the follow command:

``` 
node tunnel.js 
```
Or via npm: 
``` 
npm start
```

### Running tests

To run the unit tests of the project you can execute the follow command:
``` 
npm test
```
### Usage

Open the browser of your preference and go to [localhost:3456](http://localhost:3456).

After this you can copy the URL that you want access for example:
* https://www.w3schools.com/howto/

Try it: 
```
http://localhost:3456/https://www.w3schools.com/howto/
```

The result is web page of `https://www.w3schools.com/howto/`, but passing by the HTTP tunnel.

With this information you can try the access to the host that require IP whitelist, but for this work this server need be 
running in your whitelist server. 


<!--
## Docs and references
   * [Docs] (https://github.com/Rentcars)
   * [Swagger] (https://github.com/Rentcars)
   * [Others] (https://github.com/Rentcars)
-->
## License
Code released under the [LICENSE](LICENSE)  

## Contributors

* Anderson de Oliveira Contreira [andersoncontreira](https://github.com/andersoncontreira)
* Allysson Matheus dos Santos [allyssonm](https://github.com/allyssonm)

## Contributions 
 Pull requests and new issues are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for details. 