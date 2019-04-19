var user = {}
var request = require('request')
var Users = require('./users.js')

user.check = function(req,callback){
	Users.check(req,function(data){
		callback(data)
	})
}

module.exports = user