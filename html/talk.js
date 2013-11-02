$(document).ready(function() {
	var socket=io.connect();
	var outDiv=$('#outDiv');
	var inBox=$('#inBox');
	var subButton=$('#subButton');

	var socket=io.connect();

	$('#loginButton').click(function() {
		$('#loginFailed').hide();
		socket.emit('login',{username: $('#username').val(), password: $('#password').val() });
	});
	
	$('#loginDiv input').on('keypress',function(e) {
		if ((e.keyCode || e.which) == 13) {
			$('#loginButton').click();
		}
	});
	
	socket.on('login',function(data) {
		if (data.success) {
			$('#loginDiv').hide();
			$('#talkDiv').show();
			inBox.focus();
		} else {
			$('#loginFailed').show();
		}
	});

	inBox.on('keypress',function(e) {
		if ((e.keyCode || e.which) == 13) {
			subButton.click();
		}
	});
		
	
	subButton.on('click',function() {
		socket.emit('talk',{msg: inBox.val() });
		inBox.val('');
	});

	socket.on('connect',function() {
		$('#connectingMessage').hide();
		$('#connectedMessage').show();
	});

	socket.on('talk',function(data) {
		var messageDiv=$('<div/>').addClass('message');
		$('<span/>').addClass('from').text(data.from).appendTo(messageDiv);
		$('<span/>').addClass('fromSep').text('>').appendTo(messageDiv);
		$('<span/>').addClass('messageText').text(data.msg).appendTo(messageDiv);
		messageDiv.appendTo(outDiv);
		outDiv.scrollTop(outDiv.prop('scrollHeight'));
	});
	
	socket.on('users',function(data) {
		console.log(data);
		$('#who').text(data.users.join(' and '));
	});
	
	$('#username').focus();
	
	//console.log('started');
});