var express=require('express');
var http=require('http');
var socketio=require('socket.io');
var _=require('underscore');
var fs=require('fs');

var connections={};

var config=JSON.parse(fs.readFileSync(__dirname+'/config.json'))

var app=express();
var server=http.createServer(app);
var io=socketio.listen(server);
	
app.use(express.logger());
app.use(express.compress());
app.use('/',express.static(__dirname+'/html'));

_.each(config.ioOpts,function(v,k) {
	console.log('setting io option ' + k + ' to ' + v);
	io.set(k,v);
});

io.on('connection',function(socket) {
	console.log('Client connected');
	socket.on('login',function(data) {
		console.log('Trying to log in with: (' + data.username + ',' + data.password + ')');
		var user=config.getUser(data.username,data.password);
		if (user) {
			connections[user.username]={
				socket: socket
			};
		
			var username=user.username;
			socket.on('talk',function(data) {
				data.from=username;
				console.log(username + '-> ' + data.msg);
				_.each(connections,function(v) {
					v.socket.emit('talk',data);
				});
			});
			
			socket.on('disconnect',function() {
				console.log(username + ' has disconnected.');
				if (connections[username].socket==socket) {
					delete connections[username];
				}
				var userList=_.keys(connections);
				_.each(connections,function(v) {
					v.socket.emit('users',{users: userList});
				});
			});
			
			socket.emit('login',{success: true, user: _.pick(user,'username')});
			
			var userList=_.keys(connections);
			_.each(connections,function(v) {
				v.socket.emit('users',{users: userList});
			});
			
			console.log(username + ' logged in.');
		} else {
			socket.emit('login',{success: false});
		}
	});
});

config.getUser=function(username,password) {
	return _.find(this.users,function(user) {
		return username==user.username && password==user.password;
	})
}

server.listen(8081);

