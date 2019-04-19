//用户手机验证码
var Config = require('../config.js')
var request = require('request')

var codeSchema = new Config.mongoose.Schema({
	//用户手机号
	phone:{type:Number,default:0},
	//code
	code:{type:Number,default:0},
	//time
	time:{type:Number,default:0},
})

//获取验证码
codeSchema.statics.getCode = function(phone,callback){
	//随机6位验证码
	var a = parseInt(Math.random()*10+1);
	var code1;
	a>9?code1=9:code1=a;
	var softCode = code1*100000 + parseInt(Math.random()*10000)
	var code = encodeURIComponent("#code#="+softCode)
	var url = Config.phoneCodeRequest.replace('[phone]', phone).replace('[code]', code)
	var _this = this;
	request(url,function(err,res,body){
		if(JSON.parse(body).reason=='操作成功'){
			_this.model('Phonecodes').update({phone:phone},{phone:phone,code:softCode,time:Date.now()},{upsert:true},function(err,doc){
				err?callback({code:0,msg:'发送失败(code:102)'}):callback({code:1,msg:'发送成功'})
			})
		}else{
			callback({code:0,msg:'发送失败(code:101)'})
		}
	})
}

//校验验证码
codeSchema.statics.checkCode = function(req,callback){
	this.model('Phonecodes').findOne({phone:req.phone,code:req.code},function(err,doc){
		if(doc){
			if(Config.phoneCodeInvalid == 0){
				callback({code:1,msg:'短信验证码正确'})
			}else{
				if(doc.time+Config.phoneCodeInvalid*1000>Date.now()){
					callback({code:2,msg:'验证码已失效'})
				}else{
					callback({code:1,msg:'短信验证码正确'})
				}
			}
		}else{
			callback({code:0,msg:'短信验证码错误'})
		}
	})
}



module.exports = Config.db.model('Phonecodes',codeSchema);