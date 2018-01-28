var fs = require('fs');
var Rsync = require('rsync');
var exec = require('ssh-exec');

var console_red = "\x1b[31m";
var console_green = "\x1b[32m%s\x1b[1m";

var legion_conf = JSON.parse(fs.readFileSync('legion-conf.json', 'utf8'));
var legion_hosts = legion_conf.hosts;

console_succ("::: Chain Sync Started :::");
chain_sync(legion_hosts);

function chain_sync(hosts){
	var curr_host = hosts.shift();
	if(curr_host){
		exec('forever stopall', curr_host.username+'@'+curr_host.host, function (err, stdout, stderr) {
			if(err){
				console_err("Could not stop forever on host: "+curr_host.host);
				console.log(err, stderr);
			}else{
				console_succ("Stopped forever on host: "+curr_host.host);
				var rsync = new Rsync()
				  .shell('ssh')
				  .flags('az')
				  .exclude('node_modules')
				  .source(legion_conf.local_source+legion_conf.app_name)
				  .destination(curr_host.username+'@'+curr_host.host+':/'+legion_conf.destination);
				rsync.execute(function(error, code, cmd) {
				    if(error){
				    	console_err("Could not sync host: "+curr_host.host);
				    	console.log(error);
				    }else{
				    	console_succ("Successfully synced host: "+curr_host.host);
						exec('cd '+legion_conf.app_name+';dir;npm install;NODE_ENV=production forever start bin/www;', curr_host.username+'@'+curr_host.host, function (err, stdout, stderr) {
							if(err){
								console_err("Could not npm install and forever start on host: "+curr_host.host);
								console.log(err, stderr);
							}else{
								chain_sync(hosts);
						  		console_succ("::: Successfully restarted host: "+curr_host.host+" :::");	
							}//else no err
						});
				    }//else
				});
			}//close else
		});
	}//if more hosts exist in array
}//close chain_sync

function console_err(text){
	console.log(console_red,text);
}

function console_succ(text){
	console.log(console_green,text);
}