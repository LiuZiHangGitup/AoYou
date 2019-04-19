//用户相关
var Config = require('./../config.js')

var logSchema = new Config.mongoose.Schema({
	//用户ID
	uid:{type:Number,default:0},
	_uid:{type:String,default:''},
	data:[{
		//type  1金币日志 2操作日志 3返佣日志 4钻石日志
		time:{type:Number,default:Date.now()},
		msg:{type:String,default:'新用户注册成功'},
		type:{type:Number,default:2}
	}]
})


//新建日志表
logSchema.statics.newLog = function(data,callback){
	this.model('Logs').create(data,function(err,doc){
		err||callback({code:1,msg:'日志表创建完成'})
	})
}

//新建日志 {uid:0,type:1,msg:'xxx'}
logSchema.statics.addLog = function(data,callback){
	console.log("logData:",data);
	this.model('Logs').updateOne({uid:data.uid},{$push:{data:{time:Date.now(),msg:data.msg,type:data.type}}},function(err,doc){
		if(err){
			console.log("logData1");
			return;
		}else{
			console.log("logData2");
			callback({code:1,msg:'新日志插入成功'})
		}
	})
}


//查询日志	{uid:0,type:0}  type0返回所有
logSchema.statics.findLog = function(data,callback){
	var sLimit = 20
	var sSkip = data.page*20
	// if(data.type == 0){
		this.model('Logs').findOne({uid:data.uid}).limit(100).exec(function(err,doc){
			var soft = []
			doc.data.map(function(s,i,a){
				Config.timeInit(s.time,function(time){
					var item = {
						time:time,
						msg:s.msg,
						type:s.type
					}
					soft.unshift(item)
					if(i == a.length - 1){
						callback({code:1,data:soft})
					}
				})
			})
			
		})
}




module.exports = Config.db.model('Logs',logSchema);