import http from 'http';
import fs from 'fs';
import path from 'path';
import findPort from 'find-open-port';
import process from 'process';
import { setInterval } from 'timers/promises';
import { selectOptionsFromKeys } from 'mathjax-full/js/util/Options';

const baseDir = './formulaeditor-1.1.36e';

// https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http
// Used to host scripts locally for iframe to find
let PORT : number = undefined;
export const getPort = async () : Promise<number> =>  {
    while(!PORT) {
        await new Promise(r => setTimeout(r, 100));
    }
    return PORT;
}

const runServer = () : void => {
    findPort().then((port : number) => {
        PORT = port;
        console.log('port ', port);
        http.createServer(function (request, response) {
            // console.log('request starting...');
            let filePath = baseDir + request.url;
            if (filePath == baseDir + '/')
                filePath = baseDir + '/index.html';
            // console.log('filepath ', filePath);
        
            const extname = path.extname(filePath);
            let contentType = 'text/html';
            switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;      
                case '.jpg':
                    contentType = 'image/jpg';
                    break;
                case '.wav':
                    contentType = 'audio/wav';
                    break;
            }
        
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    if(error.code == 'ENOENT'){
                        fs.readFile('./404.html', function(error, content) {
                            response.writeHead(200, { 'Content-Type': contentType });
                            response.end(content, 'utf-8');
                        });
                    }
                    else {
                        response.writeHead(500);
                        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                        response.end(); 
                    }
                }
                else {
                    // Website you wish to allow to connect
                    response.setHeader('Access-Control-Allow-Origin', '*');
                    
                    // Request methods you wish to allow
                    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                    
                    // Request headers you wish to allow
                    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        
        }).listen(PORT);
    });
}
export default runServer;