var express=require('express');
var http=require('http');
var socketio=require('socket.io');
var _=require('underscore');


var connections={};



var app=express();
var server=http.createServer(app);
var io=socketio.listen(server);

app.use(express.logger());
app.use(express.compress());
app.use('/',express.static(__dirname+'/html'));

io.on('connection',function(socket) {
	console.log('Client connected');
	socket.on('login',function(data) {
		console.log('Trying to log in with: (' + data.username + ',' + data.password + ')');
		if ( (data.username=='user1' && data.password=='changeme1')
		   || (data.username=='user2' && data.password=='changeme2')) {
			connections[data.username]={
				socket: socket
			};
		
			var username=data.username;
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
			
			socket.emit('login',{success: true});
			
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

server.listen(8081);

