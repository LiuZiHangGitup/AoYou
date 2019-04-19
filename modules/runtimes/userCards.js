// 用户身份信息
var Config = require('./../config.js')

var cardSchema = new Config.mongoose.Schema({
	//用户ID
	uid:{type:Number,default:0},
	_uid:{type:String,default:''},
	//真实姓名
	realname:{type:String,default:''},
	//身份证号码   0体验提现 1正常流程
	cardnumber:{type:Number,default:0},
	//身份证正面
	front:{type:String,default:''},
	//身份证反面
	opposite:{type:String,default:''},
	//审核状态 0默认  1审核中   2拒绝    3通过
	status:{type:Number,default:0},
	//提现卡号
	cashCard:{type:String,default:''},
})

//新建表
cardSchema.statics.newCard = function(data,callback){
	this.model('Cards').create(data,function(err,doc){
		if(doc){
			callback({code:1,msg:'身份表创建成功'})
		}
	})
}

//更新数据
cardSchema.statics.updateCard = function(req,callback){
	this.model('Cards').update({uid:req.uid},{realname:req.realname,cashCard:req.cashCard},function(err,doc){
		if(err){
			callback({code:0,msg:'绑定失败'})
		}else{
			callback({code:1,msg:'绑定成功'})
		}
	})
}


//获取数据
cardSchema.statics.getCard = function(req,callback){
	this.model('Cards').findOne({uid:req.uid},function(err,doc){
		if(err){
			callback({code:0,msg:'用户异常'})
		}else{
			callback({code:1,msg:'获取成功',data:doc,android:Config.androidVersion,ios:Config.iosVersion})
		}
	})
}


//更改状态















module.exports = Config.db.model('Cards',cardSchema);