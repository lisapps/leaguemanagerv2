** League Manager **

The boilerplate structure is based off the tutorial used here:
https://www.freecodecamp.org/news/create-a-react-frontend-a-node-express-backend-and-connect-them-together-c5798926047c/

and here:
https://medium.com/@dtkatz/use-the-blazing-fast-parcel-bundler-to-build-and-test-a-react-app-e6972a2587e1

This project installs Jest as well, but doesn't include any tests yet. Winston is installed with the Express server for better error messaging.
The client does not include Redux or other state management frameworks since React Hooks and Context allow us to forego that.

Please note that the repo is set up for local development, and that the files on the server (www and server.js) have different port settings and names for production and dev (staging). Don't overwrite those files without noting those settings.

You must have Node and npm installed globally on your system. This project uses Node version 11.4.

To INSTALL the project:
navigate to project directory main folder where you can see the api and client folders. The Express server and React client files are separate repos within this project. They both must be running separately, at the same time.

command line:

$ cd api
$ npm install

$ cd client
$ npm install

(if you want to use prettier code formatter make sure the code below is in your package.json file. Use only on the client files package.json, not needed in API server.)

Put the following into your package.json (add format line to scripts if scripts parameter is already in there):
"scripts": {
"format": "prettier --write \"src/\*_/_.{js,jsx}\"",
},

## Development:

Parcel is used to host a client page server on localhost for development. It's easier and cleaner than using something like createreactapp. It's run as described below on the command line for the client.
The API server uses Node and Express, and is started the same way. It interacts with the backend, and gets and sends information to the API's created by Vdoit.

To set up the project from a new download, you must run npm install in both the client and api directories.

To RUN the project in development you must start the server AND the client in 2 terminal windows:

terminal 1:
cd api
npm run dev

terminal 2:
cd client
npm run dev

terminal 3:
Make sure you have git installed globally. Use this window for git pushes to bitbucket. Please create a new branch whenever editing, and push that branch. Repo Administrator will do the merge.
Handy cheat sheet: https://www.keycdn.com/blog/git-cheat-sheet#commands-for-git-branching

## Test: (no tests currently set up so will have errors)

npm run test

## Staging:

Open a terminal window.
$ npm run staging
 Ftp dist folder to server using Filezilla.
 - browse in Filezilla to apache server folder: ../home/avp/avp-dev/frontend-avp-v2/client 
 - ftp app.js, .env, package.json and routes folder to ..../home/avp/avp-dev/frontend-avp-v2/client
 Make sure server-dev.js file is using port 5000, and www-dev uses port 3002.
$ ssh root@134.209.3.13
$ cd ../../home/avp/avp-dev/frontend-avp-v2/client
$ pm2 list (to see what apps are running and make sure the name is server-dev)
$ pm2 stop server-dev
$ pm2 start server-dev.js
$ cd ../api
$ pm2 list (to see what apps are running and make sure the name is www-dev)
$ pm2 stop www-dev
$ npm start (have to run npm so the enviroments are picked up)
ctrl + c
$ pm2 start ./bin/www-dev

## Production:
For initial setup, push everything but the node module and logs directories to the server.

Make sure the port in server.js is set to 80.

Locally, cd to client directory using terminal window.
$ npm run build.
 Ftp dist folder to server using Filezilla. (Delete any existing dist folder first)
 - browse in Filezilla to apache server folder: ../home/avp/avp-prod/frontend-avp-v2/client 
 - Ftp app.js, .env, package.json and routes folder to ..../home/avp/avp-prod/frontend-avp-v2/api
 Make sure server.js is file using port 80.
$ ssh root@134.209.3.13
$ cd ../home/avp/avp-prod/frontend-avp-v2/client
$ pm2 list (to see what apps are running and make sure the name is server)
$ pm2 stop server
$ pm2 start server.js
$ cd ../api
$ pm2 list (to see what apps are running and make sure the name is npm start)
$ pm2 stop 'npm start'
$ npm start  (have to run npm so the enviroments are picked up)
ctrl + c
$ pm2 start 'npm start'


#############################################

---- Notes -----

Problems getting the Express server working can be hard to troubleshoot. Console logging of errors is set to only happen in "dev" environment, in the app.js file.
Winston provides error logging, and the logs it creates can be found in /home/avp/avp-dev/frontend-avp-v2/api/logs, or /home/avp/avp-prod/frontend-avp-v2/api/logs, depending on staging or production.

PM2 is used to run client and backend express, and it keeps apps alive forever. Documentation can be found here: https://github.com/Unitech/pm2.
