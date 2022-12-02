/**
 *  Frontend Logic for the Application
 */

// Container for the frontend application
const app = {}

// Config
app.config = {
  'sessionToken' : false
};

// AJAX Client (for the restful API)
app.client = {};

// Inerface for making API calls
app.client.request = function(headers, path, method, queryStringObject, payload, callback){

  // Set defaults 
  headers = typeof(headers) == "object" && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  let requestUrl = path + '?';
  let counter = 0;

  for(let queryKey in queryStringObject){

    if(queryStringObject.hasOwnProperty(queryKey)){
      counter++;
      // If at least one query string parameter has already been added, prepend new ones with an ampersand
      if(counter > 1){
        requestUrl += '&';
      }
      // Add the key and value
      requestUrl += queryKey + '=' + queryStringObject[queryKey];
    };
  };

  // Form the http request as a JSON type
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);

};