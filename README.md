# jsonapi
### An ExpressJS API implementing the JSON API specification

[![Coverage Status](https://coveralls.io/repos/github/timrourke/jsonapi/badge.svg?branch=master)](https://coveralls.io/github/timrourke/jsonapi?branch=master)

The goal of this project is to build an extensible, well-tested framework for creating JSON API servers using [ExpressJS](https://github.com/expressjs/express) and [Sequelize](https://github.com/sequelize/sequelize).

## Progress toward full compliance with the JSON API specification

- [ ] [Content Negotiation](http://jsonapi.org/format/#content-negotiation)
  - [x] [Client Responsibilities](http://jsonapi.org/format/#content-negotiation-clients)
    - [x] Clients MUST send all JSON API data in request documents with the header Content-Type: application/vnd.api+json without any media type parameters.
    - [x] Clients that include the JSON API media type in their Accept header MUST specify the media type there at least once without any media type parameters.
    - [x] Clients MUST ignore any parameters for the application/vnd.api+json media type received in the Content-Type header of response documents.
  - [x] [Server Responsibilities](http://jsonapi.org/format/#content-negotiation-servers)
    - [x] Servers MUST send all JSON API data in response documents with the header Content-Type: application/vnd.api+json without any media type parameters.
    - [x] Servers MUST respond with a 415 Unsupported Media Type status code if a request specifies the header Content-Type: application/vnd.api+json with any media type parameters.
    - [ ] Servers MUST respond with a 406 Not Acceptable status code if a request’s Accept header contains the JSON API media type and all instances of that media type are modified with media type parameters.

- [ ] [Document Structure](http://jsonapi.org/format/#document-structure)
	- [ ] [Top Level](http://jsonapi.org/format/#document-top-level)
		- [x] A JSON object MUST be at the root of every JSON API request and response containing data.
		- [x] A document MUST contain at least one of the following top-level members: (`data`, `errors`, `meta`)
		- [x] The members `data` and `errors` MUST NOT coexist in the same document.
		- [x] A document MAY contain any of these top-level members: (`jsonapi`, `links`, `included`)
