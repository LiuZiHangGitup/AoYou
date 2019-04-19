var express = require('express');
var router = express.Router();
var Admin = require('../modules/admin/adminSocket.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({code:1});
});

router.post('/',function(req,res,next){
	res.send('6666666666666')
})

router.post('/adminlogin',function(req,res,next){
	Admin.adminLogin(req.body,function(data){
		res.cookie("adminCookie",data.data.cookie,{
	        maxAge: 1000 * 3600 * 24 * 30,
	        httpOnly: true,
	        signed: false
	    })
	    res.cookie("adminName",data.data.name,{
	        maxAge: 1000 * 3600 * 24 * 30,
	        httpOnly: true,
	        signed: false
	    })
		res.send(data)
	})
})

var adminRules = ['getTalk','adminLogin','connect']


router.post('/adm',function(req,res,next){
	console.log(req.cookies)
	var data = req.body
	console.log('收到管理员请求============',data)
	if(adminRules.indexOf(data.type)!=-1){
		Admin[data.type](data.data,function(doc){
			res.send(doc)
		})
	}else{
		//进行验证{_id,session,adminLevel}
		//首先解析cookie
		var cookies = req.cookies
		// var cookies = cookie.parse(user.handshake.headers.cookie)
		
		new Promise(function(resolve,reject){
			Admin.check(cookies,function(doc){
				doc.code==1?resolve():reject(doc)
			})
		}).then(function(){
			Admin[data.type](data.data,function(doc){
				res.send(doc)
				console.log(data.type+'After回执数据==========',doc)
			})
		}).catch(function(doc){
			console.log('000000=====000000:',doc)
			// user.emit(data.type+'After',{code:-1,msg:'登录信息过期'})
			Admin[data.type](data.data,function(doc){
				res.send(doc)
				console.log(data.type+'After回执数据==========',doc)
			})
			// res.send({code:-1,msg:'登录信息过期'})
			})
	}
})


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

module.exports = router;
