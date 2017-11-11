var mongo = require('mongodb').MongoClient;
const port = process.env.PORT || 3000;
var client = require('socket.io').listen(port).sockets;

//mongodb://<dbuser>:<dbpassword>@ds157475.mlab.com:57475/jintelware
mongo.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/mongochat', function(err, db){

//mongo.connect('mongodb://jrix:jrix123@ds157475.mlab.com:57475/jintelchat', function(err, db){
	if(err){
		throw err
	}
	client.on('connection', function(socket){
		var chat = db.collection('chats');
		sendStatus = function(s){
			socket.emit('status', s);
		};

		chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
			if(err){
				throw err
			}
			socket.emit('output', res);
		});

		socket.on('input', function(data){
			var name = data.name;
			var message = data.message;

			if(name == '' || message == ''){
				sendStatus('Please fill in name and message');
			} else {
				chat.insert({name: name, message: message}, function(){
					client.emit('output', [data]);

					sendStatus({
						message: 'Message Sent',
						clear: true
					});
				});
			}
		});

		socket.on('clear', function(data){
			chat.remove({}, function(){
				socket.emit('cleared');
			});
		});
	});
});
