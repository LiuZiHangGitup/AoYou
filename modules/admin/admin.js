//管理员
var Config = require('./../config.js')
var User = require('../runtimes/users.js')
var Log = require('../runtimes/logs.js')

var administratorSchema = new Config.mongoose.Schema({
	//管理员账号
	username:{type:String,default:''},
	//管理员密码
	password:{type:String,default:''},
	//管理员等级
	level:{type:Number,default:1},
	//管理员最后登录时间
	lastLoginTime:{type:Number,default:1},
	//管理员创建时间
	createTime:{type:Number,default:1},
	//管理员session
	session:{type:String,default:''},
})

//登录会回传cookie 这个保存到客户端 用来匹配验证登录状态
administratorSchema.statics.login = function(req,callback){
	req.password = Config.toMd5('admin'+req.password+req.password+'admin')
	this.model('Administrators').findOne(req,function(err,doc){
		if(doc){
			//召唤Cookie大法
			var cookie = Config.toMd5(req.password+Date.now()+'cookie')

			//让cookie更加cookie
			var sessionCode = Config.toMd5('adminl'+cookie+'adminr')

			doc.lastLoginTime = Date.now()
			doc.session = sessionCode

			doc.save(function(err,doc){
				if(doc){
					callback({code:1,msg:'登录成功',data:{level:doc.level,cookie:cookie,name:req.username}})
				}
			})
		}else{
			callback({code:0,msg:'登录失败,请检查登录信息'});
		}
	})
}

administratorSchema.statics.newAdmin = function(req,callback){
	var adminer = {
		username:req.username,
		password:Config.toMd5('admin'+req.password+req.password+'admin'),
		level:req.level,
		createTime:Date.now()
	}
	this.model('Administrators').create(adminer,function(err,doc){
		if(doc){
			callback({code:1,msg:'新管理员账号创建成功'})
		}else{
			callback({code:0,msg:'创建失败'})
		}
	})
}

administratorSchema.statics.check = function(req,callback){
	callback({code:1})
}

administratorSchema.statics.userPay = function(req,callback){
	this.model('Users').findOne({uid:req.uid},function(err,doc){
		if(req.type == 0){
			doc.gold+=req.num
		}else{
			doc.score+=req.num
		}
		doc.save(function(err,doc){
			if(err){
				callback({code:0,msg:'处理失败'})
			}else{
				callback({code:1,msg:'充值成功'})
			}
		})
	})
}


administratorSchema.statics.newNotice = function(req,callback){
	this.model('Markets').updateOne({strong:8},{msg:req.msg},function(err,doc){
		if(err){
			callback({code:0,msg:'更新失败'})
		}else{
			callback({code:1,msg:'更新成功'})
		}
	})
}


administratorSchema.statics.delGood = function(req,callback){
	this.model('Markets').deleteOne({_id:req._id},function(err,doc){
		callback({code:1})
	})
}

administratorSchema.statics.newGood = function(req,callback){
	this.model('Markets').create(req,function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}


administratorSchema.statics.getOrder = function(req,callback){
	this.model('Orders').find({},function(err,doc){
		callback({code:1,data:doc})
	})
}

administratorSchema.statics.changeOrder = function(req,callback){
	this.model('Orders').updateOne({_id:req._id},{stu:req.type},function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}

administratorSchema.statics.returnOrder = function(req,callback){
	var _this = this;
	this.model('Orders').findOne({_id:req._id},function(err,doc){
		doc.stu = 5;
		doc.save(function(){
			var num = doc.num;
			var uid = doc.uid;
			_this.model('Markets').findOne({_id:doc.goodId},function(err1,doc1){
				var rich = num*doc1.price;
				User.changeRich({uid:uid,type:'gold',num:rich,increase:true},function(data){
					if(data.code == 1){
						callback({code:1,msg:'退款完成'})
						Log.addLog({uid:uid,type:1,msg:'购物退款'+rich+'元'},function(){})
					}
				})
			})
		})
	})
}

administratorSchema.statics.delOrder = function(req,callback){
	this.model('Orders').deleteOne({_id:req._id},function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}


administratorSchema.statics.allin = function(callback){
	this.model('Paylists').findOne({time:8888},function(err,doc){
		callback({code:1,num:doc.num})
	})
}

// })






























module.exports = Config.db.model('Administrators',administratorSchema);