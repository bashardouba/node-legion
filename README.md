![Alt text](https://cubicconnect.com/img/node-legion-logo.png "Node Legion Logo")

# node-legion
Node Legion is an ultra-simple solution for syncing a local Node.js project with multiple remote instance deployments.

## Environment and Assumptions
* This project was run on an Ubuntu 16.04 x64 development machine. Will probably work on Windows 10 (things will probably break otherwise, future versions to fix this).
* All remote machines that sync to the local Node.js project are running Ubuntu 16.04 x64 (again, use otherwise at your own risk) and **have been configured for root ssh access via key-based authentication on your development machine**.
* All Node.js remote instances are started and stopped via forever. We assume the server startup script to be located at legion-app/bin/www

## How It Works
There are three folders in the node-legion project:

### legion-app
This folder should contain your Node.js project. You can utilize any directory structure you like but **the startup script for the server must be located in legion-app/bin/www** like the sample express project generated using express-generator provided in this repo. The legion-app will be replicated (synced) across a list of hosts (which will be automatically started on the hosts too) with legion-sync.

### legion-host-init
The legion-host-init tool is used to prepare a fresh install of Ubuntu 16.04 x64 on a remote host for receiving and running your Node.js project. This basically means that this tool can be used to do things like installing Node.js, creating a symbolic link from "nodejs" to "node", installing NPM, express and forever. To define the new legion host IP and the (sequence sensitive) set of commands used to initialize it for inclusion in your legion check host-conf.json.
```
{
	"host":"XX.XX.XX.XX",
	"username":"root",
	"commands":["apt-get update","apt-get install nodejs --assume-yes","ln -s /usr/bin/nodejs /usr/bin/node","apt-get install npm --assume-yes","npm install -g express express-generator forever"]
}
```
When you're ready to initialize the remote legion host (i.e. after defining the IP and set of init commands in host-conf.json), run ```npm start``` inside the legion-host-init folder.

### legion-sync
Legion-sync is the tool you will use to replciate your local development environment (legion-app) across any given number of remote hosts. Legion-sync will go through the following process to sync every legion host to your legion-app:
1. Run forever stopall on the remote legion host
2. Rsync the legion-app folder to /root/legion-app (excluding node_modules)
3. SSH into the remote legion host
4. Navigate to the legion-app folder
5. Run ```npm install``` in the remote host legion-app folder
6. Run ```NODE_ENV=production forever start bin/www``` in the remove host legion-app folder. 
To configure legion-sync, edit the legion-conf.json file in the legion-sync folder:
```
{
	"local_source":"/path/to/node-legion/",
	"app_name":"legion-app",
	"destination":"/root",
	"hosts":[
		{ "host":"XX.XX.XX.XX", "username":"root" },
		{ "host":"XX.XX.XX.XX", "username":"root" },
		{ "host":"XX.XX.XX.XX", "username":"root" }
	]
}
```
* Do not change app_name or destination.
* Modify local_source to point to your node-legion folder (the one you cloned to your local machine).
* Set up the list of hosts to sync the local project to. Do not change the username, only the IPs.
When you've configured legion-conf.json. Run  ```npm start``` inside the legion-sync folder.

## Work in Progress
This is a work in progress. Nothing too fancy!
