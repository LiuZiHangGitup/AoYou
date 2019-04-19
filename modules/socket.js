//中央控制器
var _socket = {};
var socket_io = require('socket.io');
var cookieParser = require('cookie-parser');

var apiTest = require('./ApiTest.js')

var Admin = require('./admin/adminSocket.js')
var Users = require('./runtimes/userSocket.js')
var App = require('./businessLogic/appSocket.js')

//设置管理员权限 通过等级看限制的路由
var adminRules = [
// 不需要过验证的请求
	'getTalk','adminLogin','connect'
]

var userRules = [
	//不需要通过验证的请求
	'login','reg'
]

_socket.getSocketio = function(server){
	var _io = socket_io.listen(server)

	_io.on('connection',function(user){
		user.emit('test','TTTTTTest')

		user.on('app',function(res){
		})

		user.on('admin',function(data){
			if(adminRules.indexOf(data.type)!=-1){
				Admin[data.type](data.data,function(doc){
					user.emit(data.type+'After',doc)
				})
			}else{
				//进行验证{_id,session,adminLevel}
				//首先解析cookie
				var cookies = cookieToJson(user.handshake.headers.cookie)
				// var cookies = cookie.parse(user.handshake.headers.cookie)
				
				new Promise(function(resolve,reject){
					Admin.check(cookies,function(res){
						res.code==1?resolve():reject()
					})
				}).then(function(){
					Admin[data.type](data.data,function(doc){
						user.emit(data.type+'After',doc)
					})
				}).catch(function(){
					// user.emit(data.type+'After',{code:-1,msg:'登录信息过期'})
					user.emit('cookieError',{code:-1,msg:'登录信息过期'})
				})
			}
		})


		user.on('game',function(data){
			if(userRules.indexOf(data.type)!=-1){
				Game[data.type](data.data,function(doc){
					user.emit(data.type+'After',doc);
				})
			}else{
				//验证用户身份信息
				var cookies = cookieToJson(user.handshake.headers,cookie)
				new Promise(function(resolve,reject){
					Users.check(cookies,function(doc){
						doc.code == 1?resolve():reject()
					})
				}).then(function(){
					Users[data.type](data.data,function(doc){
						user.emit(data.type+'After',doc)
					})
				}).catch(function(){
					user.emit('cookieError',{code:-1,msg:'登录信息过期'})
				})

			}
		}) 


		user.on('app',function(data){
			if(userRules.indexOf(data.type)!=-1){
				App[data.type](data.data,function(doc){
					user.emit(data.type+'After',doc)
				})
			}else{
				//验证用户身份信息
				var cookies = cookieToJson(user.handshake.headers.cookie)
				new Promise(function(resolve,reject){
					Users.check(cookies,function(doc){
						doc.code == 1?resolve():reject()
					})
				}).then(function(){
					Users[data.type](data.data,function(doc){
						user.emit(data.type+'After',doc)
					})
				}).catch(function(){
					user.emit('cookieError',{code:-1,msg:'登录信息过期'})
				})

			}
		})


		user.on('getTalk',function(){
			Admin.getTalk(function(body){
				user.emit('getTalkAfter',body)
			})
		})

		user.on('test',function(res){
			user.emit('testAfter',res+'--GOOD')
		})

		//Api测试
		user.on('getCode',function(res){
			apiTest.getCode(res,function(data){
				user.emit('getCodeAfter',data)
			})
		})

		user.on('userReg',function(res){
			apiTest.userReg(res,function(data){
				user.emit('userRegAfter',data)
				// _io.emit('userChange',{})
			})
		})

		user.on('userLogin',function(res){
			apiTest.userLogin(res,function(data){
				user.emit('userLoginAfter',data)
			})
		})

		user.on('changePwd',function(res){
			apiTest.changePwd(res,function(data){
				user.emit('changePwdAfter',data)
			})
		})

		user.on('changeRich',function(res){
			apiTest.changeRich(res,function(data){
				user.emit('changeRichAfter',data)
			})
		})
		
		user.on('addLog',function(res){
			apiTest.addLog(res,function(data){
				user.emit('addLogAfter',data)
			})
		})

		user.on('findLog',function(res){
			apiTest.findLog(res,function(data){
				user.emit('findLogAfter',data)
			})
		})

		user.on('findChildren',function(res){
			apiTest.findChildren(res,function(data){
				user.emit('findChildrenAfter',data)
			})
		})

		user.on('ordinary',function(res){
			apiTest.ordinary(res,function(data){
				user.emit('ordinaryAfter',data)
			})
		})

		user.on('senior',function(res){
			apiTest.senior(res,function(data){
				user.emit('seniorAfter',data)
			})
		})

		user.on('addGood',function(res){
			apiTest.addGood(res,function(data){
				user.emit('addGoodAfter',data)
			})
		})

		user.on('getGood',function(res){
			apiTest.getGood(res,function(data){
				user.emit('getGoodAfter',data)
			})
		})

		user.on('updateGood',function(res){
			apiTest.updateGood(res,function(data){
				user.emit('updateGoodAfter',data)
			})
		})

		user.on('delGood',function(res){
			apiTest.delGood(res,function(data){
				user.emit('delGoodAfter',data)
			})
		})

		user.on('buyGood',function(res){
			apiTest.buyGood(res,function(data){
				user.emit('buyGoodAfter',data)
			})
		})

		user.on('getWh',function(res){
			apiTest.getWh(res,function(data){
				user.emit('getWhAfter',data)
			})
		})

		user.on('addSth',function(res){
			apiTest.addSth(res,function(data){
				user.emit('addSthAfter',data)
			})
		})

		user.on('cutSth',function(res){
			apiTest.cutSth(res,function(data){
				user.emit('cutSthAfter',data)
			})
		})

		user.on('toCash',function(res){
			apiTest.toCash(res,function(data){
				user.emit('toCashAfter',data)
			})
		})


		
		
	})
};


function cookieToJson(cookieStr) {
	if(cookieStr){
		var cookieArr = cookieStr.split(";");
	    var obj = {} 
	    cookieArr.forEach((i) => {
	        var arr = i.split("=");
	        obj[arr[0].replace(/\s+/g,"")] =arr[1];
	    });
	    return obj
	}else{
	    var obj = {cookie:'null'} 
	    return obj
	}
    
  }


module.exports = _socket;