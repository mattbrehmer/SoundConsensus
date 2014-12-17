var http = require('http');
var path = require('path');
var fs = require('fs');

var handleRequest = function(request, response) {

  var pathname = request.url;

  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }

  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  // What is it?  Default to plain text
  var contentType = typeExt[ext] || 'text/plain';
  
  // Now read and write back the file with the appropriate content type
  fs.readFile(__dirname + pathname,    
    function (err, data) {      
      if (err) {
        response.writeHead(500);
        return response.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      response.writeHead(200,{'Content-Type': contentType });
      response.end(data);
    }
  );
}

// Create a server with the handleRequest callback
var server = http.createServer(handleRequest);
// Listen on port 8080
server.listen(8080);

console.log('Server started on port 8080');