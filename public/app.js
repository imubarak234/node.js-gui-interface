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
  xhr.setRequestHeader("Content-Type", "application/json");

  // For each header sent, add it to the request
  for (let headerKey in headers){

    if(headers.hasOwnProperty(headerKey)){
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }


  // If there is a current session token set, add that as a header
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function(){
    if(xhr.readyState == XMLHttpRequest.DONE){
      let statusCode = xhr.status;
      let responseReturned = xhr.responseText;

      // Callback if requested
      if (callback){
        try{
          let parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        }
        catch(e){
          callback(statusCode, false);
        }
      }
    }
  };

  // Send the payload as JSON
  let payloadString = JSON.stringify(payload);
  console.log("String payload", payloadString)
  xhr.send(payloadString);

};

// Bind the forms
app.bindForms = function(){
  let formObj = document.querySelector("form")
  formObj.addEventListener("submit", (e) => {

    // Stop it from submitting
    e.preventDefault();
    let formId = formObj.id;
    let path = formObj.action;
    // console.log(formObj.id)
    // console.log(formObj.action)
    console.log(formObj.action)
    // console.log(this)
    // console.log(e)
    let method = formObj.method.toUpperCase();

    // Hide the error message (if it's currently shown gue to a previous error)
    document.querySelector( "#" + formId + " .formError" ).style.display = 'hidden'; 

    // Turn the inputs into a payload
    let payload = {};
    let elements = formObj.elements;
    for(let i = 0; i < elements.length; i++){

      if( elements[i].type !== 'submit' ){
        let valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
        payload[elements[i].name] = valueOfElement;
      }
    }

    console.log(payload)

    // Call the API
    app.client.request( undefined, path, method, undefined, payload, function( statusCode, responsePayload ){

      // Display an error on the form if needed
      if(statusCode !== 200){

        // Try to get error from API, or set a default error message
        let error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occcured, please try again';

        // Set the formError field with the error text
        let errorElement =  document.querySelector( "#" + formId + " .formError" )
        console.log(document.querySelector("#accountCreate .formError"));
        errorElement.innerHTML = error;

        // Show (unhide) the form error field on the form
        document.querySelector( "#" + formId + " .formError" ).style.display = 'block';
      }
      else {
        // If successful, send to form response processor
        app.formResponseProcessor( formId, payload, responsePayload )
      }
    } );
  });
};

// Form response processor 
app.formResponseProcessor = function( formId, requestPayload, responsePayload ){
  let functionToCall = false;
  if( formId == 'accountCreate' ){
    console.log("The accountCreate form was successfully submitted")
    // @TODO Do something here now that the acount has been created successfully
  }
};

// Init (bootstrapping)
app.init = function(){
  // Bind all form submissions
  app.bindForms();
}

// Call the init processes after the window loads
window.onload = () => {
  app.init();
}