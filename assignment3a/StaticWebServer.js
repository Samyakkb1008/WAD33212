const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Port on which the server will listen
const PORT = 1800;

// Mapping file extensions to MIME types
const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/font-sfnt'
};

// Creating the server
http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    
    // Handling root URL request
    if (parsedUrl.pathname === "/") {
        res.setHeader('Content-type', 'text/html');
        let filesList = fs.readdirSync("./");
        let filesLink = "<h1>List of files:</h1><ul>";
        
        filesList.forEach(file => {
            if (fs.statSync("./" + file).isFile()) {
                filesLink += `<li><a href='./${file}'>${file}</a></li>`;
            }
        });
        
        filesLink += "</ul>";
        res.end(filesLink);
        return;
    }

    // Sanitizing path to prevent directory traversal
    const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname, sanitizePath);

    // Check if file exists
    if (!fs.existsSync(pathname)) {
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
    }

    // Reading and serving the file
    fs.readFile(pathname, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.end(`Error reading file.`);
            return;
        }
        
        const ext = path.parse(pathname).ext;
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
    });
}).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
