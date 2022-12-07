/**
 * Server-related tasks
 */

//Dependencies
const http = require('http');
const https = require('https')
const { StringDecoder } = require('string_decoder');
const url = require('url');
//const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');
// const _data = require('./lib/data');

/**
 * @TODO GET RID OF THIS
 */
// helpers.sendTwilioSms('+2348091902743', 'Hello!', function(err){
//   console.log('this was the error', err);
// });




// Testing
// @TODO delete this
// _data.create('test','newFile', {'foo' : 'bar'}, function(err){
//   console.log('this was the error', err)
// });

// _data.read('test', 'newFile', function(err, data){
//   console.log('this was the error ', err, 'and this was the data ', data)
// });

// _data.update('test', 'newFile', { 'fizz' : 'buzz' }, function(err){
//   console.log('this was the error ', err)
// });

// _data.delete('test', 'newFile', function(err){
//   console.log('this was the error ', err)
// });



// Instantiate the server module object
let server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res) {
  server.unifiedServer(req, res);  
});



// Instantiate the HTTPS server
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(path.join(__dirname, '/../https/-cert.pem'))),
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
  unifiedServer(req, res);  
});




// All the server logic for the http and https server
server.unifiedServer = function(req, res){
  // Get the URL and parse it
  let parsedUrl = url.parse(req.url, true);

  // Get the path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the query string as an object
  let queryStringObject = parsedUrl.query;

  //Get the HTTP Method
  let method = req.method.toLowerCase();

  // Get the headers as an object
  let headers = req.headers


  // Get the payload, if any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });
  req.on('end', function(){
    buffer += decoder.end();

    // Choose the handler this request should go to. if one is not found use the not found hanler
    let ChoosenHandler = typeof(server.router[trimmedPath]) != 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // If the request is within the public directory, use the public handler instead
    ChoosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : ChoosenHandler;

    // Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer),
    };

    // Route the request to the handler specified in the router
    ChoosenHandler(data, function(statusCode, payload, contentType){

      
      // Determine the type of response (fallback to JSON)
      contentType = typeof(contentType) == 'string' ? contentType : 'json';

      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;


      // Return the reponse parts that are content-specific
      payloadString = "";

      if(contentType == 'json'){
        res.setHeader('Content-Type', 'application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }

      if(contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        // console.log("this is the payload", payload)
        payloadString = typeof(payload) == "string" ? payload : "";
      }
      if(contentType == 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        // console.log("this is the payload", payload)
        payloadString = typeof(payload) !== 'undefined' ? payload : "";
      }
      if(contentType == 'css') {
        res.setHeader('Content-Type', 'text/css');
        // console.log("this is the payload", payload)
        payloadString = typeof(payload) !== 'undefined' ? payload : "";
      }
      if(contentType == 'png') {
        res.setHeader('Content-Type', 'image/png');
        // console.log("this is the payload png", payload)
        payloadString = typeof(payload) !== 'undefined' ? payload : "";
      }
      if(contentType == 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        // console.log("this is the payload", payload)
        payloadString = typeof(payload) !== 'undefined' ? payload : "";
      }
      if(contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        // console.log("this is the payload", payload)
        payloadString = typeof(payload) !== 'undefined' ? payload : "";
      }

      //return the response parts that are common to all content-types
      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green otherwise print red
      if(statusCode  == 200){
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      }
      else{
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      }
      
    });

  });
};


// Define a request router
server.router = {
  '' : handlers.index,
  'account/create' : handlers.accountCreate,
  'account/edit' : handlers.accountEdit,
  'account/deleted' : handlers.accountDeleted,
  'session/create' : handlers.sessionCreate,
  'session/deleted' : handlers.sessionDeleted,
  'checks/all' : handlers.checskList,
  'checks/create' : handlers.checksCreate,
  'checks/edit' : handlers.checksEdit,
  'ping' : handlers.ping,
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'api/checks' : handlers.checks,
  'favicon.ico' : handlers.favicon,
  'public' : handlers.public
};

// Init script
server.init = function() {

  //Start the server
  server.httpServer.listen(config.httpPort, function() {
    console.log('\x1b[31m%s\x1b[0m', "The server is listening on port "+config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function() {
    console.log('\x1b[32m%s\x1b[0m', "The server is listening on port "+config.httpsPort);
  });
};


// Export the module
module.exports = server;