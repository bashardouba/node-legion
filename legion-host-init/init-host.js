var fs = require('fs');
var exec = require('ssh-exec');

var console_red = "\x1b[31m";
var console_green = "\x1b[32m%s\x1b[1m";

var host_conf = JSON.parse(fs.readFileSync('host-conf.json', 'utf8'));
var init_commands = host_conf.commands.join(";")+";";

exec(init_commands, host_conf.username+'@'+host_conf.host).pipe(process.stdout);

function console_err(text){
	console.log(console_red,text);
}

function console_succ(text){
	console.log(console_green,text);
}