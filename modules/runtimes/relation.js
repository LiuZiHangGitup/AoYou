//处理附庸关系

var Config = require('./../config.js');

const path = require('path');

var Logs = require('./logs.js');
var Users
var fs = require('fs')
fs.readFile(__dirname+'/users.js', function (err, data) {
   if (err) {
       return console.error(err);
   }
   Users = require('./users.js')
});





var distributionSchema = new Config.mongoose.Schema({
	//用户ID
	uid:{type:Number,default:0},
	//父级ID
	fuid:{type:Number,default:0},
	//机构等级 如果是0 就是普通用户
	lv:{type:Number,default:0},
})

//用户注册创建初始关系
distributionSchema.statics.addDistribution = function(req,callback){
	if(req.fuid+''=='null'){req.fuid=0}
	this.model('Distributions').create(req,function(err,doc){
		err||callback({code:1,msg:'用户关系表建立'})
	})
}


//用户获取下级	{uid:0,layer:1}
distributionSchema.statics.findChildren = function(req,callback){
	var softData = []
	var endData = []
	var conData = []
	var layerIndex = 0
	var _this = this
	//layer 查询几级 如果是0 查询全部
	//第一步 先获取ID为0的用户 这是一级下级
	this.model('Distributions').find({fuid:req.uid},['fuid','uid'],function(err,doc){
		if(doc.length == 0){
			//没有下级
			callback({code:1,data:[],msg:'暂无下级'})
		}else{
			//存储一下第一级
			if(req.layer == 1){
				if(req.uid == 0){
					var sc = []
					for(var i=0;i<doc.length;i++){
						if(doc[i].uid==0&&doc[i].fuid==0){

						}else{
							sc.push(doc[i])
						}
					}
					if(sc.length == 0){
						callback({code:1,data:[],msg:'暂无下级'})
					}else{
						softData.push(sc)
						// findRun(sc)
					}
					callback({code:1,data:softData,msg:'1级下级查询完成'})
				}else{
					softData.push(doc)
					callback({code:1,data:softData,msg:'1级下级查询完成'})
				}
				
			}else{
				if(req.uid == 0){
					var sc = []
					for(var i=0;i<doc.length;i++){
						if(doc[i].uid==0&&doc[i].fuid==0){

						}else{
							sc.push(doc[i])
						}
					}
					if(sc.length == 0){
						callback({code:1,data:[],msg:'暂无下级'})
					}else{
						softData.push(sc)
						findRun(sc)
					}
				}else{
					softData.push(doc)
					findRun(doc)
				}
				
			}
		}
	})
	var sIndex = 0;

	function findRun(data){
		//先塞进去一个空容器承接下级组
		softData.push([])

		var dataIndex = 0
		var dataCount = data.length

		
		
		runNext()

		//根据上级找下级
		function runNext(){
			findLayer(data[dataIndex].uid,function(doc){
				for(var i = 0;i<doc.length;i++){
					if(doc[i].fuid==0&&doc[i].uid==0){

					}else{
						softData[sIndex+1].push(doc[i])
					}
				}
				if(dataIndex == data.length-1){
					if(softData[sIndex+1].length == 0){
						if(req.layer==0){
							callback({code:1,data:softData,msg:'查询完成'})
						}else{
							if(softData[req.layer-1]){
								callback({code:1,data:softData[req.layer-1],msg:'查询完成'})
							}else{
								callback({code:1,data:[],msg:'查询完成'})
							}
							
						}
					}else{
						sIndex++
						findRun(softData[sIndex])
					}
				}else{
					dataIndex++
					runNext()
				}
			})
		}
	}

	function findLayer(cid,callback){
		_this.model('Distributions').find({fuid:cid},['fuid','uid'],function(err,doc){
			callback(doc)
		})
	}
}


//返佣写法 -> 普通 {uid：0,num:100}
distributionSchema.statics.ordinary = function(req,callback){
	var _this = this;
	var layer = Config.ordinaryRule.length
	if(layer == 0){
		callback({code:0,msg:'未开放普通返佣'})
		return
	}
	var startIndex = 0;
	var videoIndex = 0;
	var zlhzIndex = 0;
	var fuid = req.uid;
	function findFatherAndGiveGold(){
		_this.model('Distributions').findOne({uid:fuid},function(err,doc){
			if(doc.fuid == 0||startIndex == Config.ordinaryRule.length||videoIndex == Config.videoRule.length || zlhzIndex == Config.zlhzRule.length){
				callback({code:1,msg:'普通返佣完成'})
			}else if(req.formAddress=='ylh'){
				//给父级加金币以及日志doc.fuid
				Users.changeRich({uid:doc.fuid,type:'xiaobeike',num:req.num*Config.ordinaryRule[startIndex],increase:true},function(){
					//加日志
					Logs.addLog({uid:doc.fuid,type:1,msg:"获得"+req.uid+"用户"+(startIndex+1)+"级小倍壳"+(req.num*Config.ordinaryRule[startIndex].toFixed(2))+"个"},function(){
						startIndex++;
						fuid = doc.fuid;
						findFatherAndGiveGold()
					})
				})
			}else if(req.formAddress=='zlhz'){
				//给父级加金币以及日志doc.fuid
				var fanyong = 0;
				if(zlhzIndex == 0){
					fanyong = req.oncecom;
				}else if(zlhzIndex == 1){
					fanyong = req.secondcom;
				}
				Users.changeRich({uid:doc.fuid,type:'xiaobeike',num:(req.num*fanyong/100).toFixed(2),increase:true},function(userData){
					//加日志
					Logs.addLog({uid:doc.fuid,type:1,msg:"获得"+req.uid+"用户"+(zlhzIndex+1)+"级小倍壳"+(req.num*fanyong/100).toFixed(2)+"个"},function(logData){
						zlhzIndex++;
						fuid = doc.fuid;
						findFatherAndGiveGold();
					})
				})
			}else if(req.formAddress=='video'){
				//给父级加金币以及日志doc.fuid
				Users.changeRich({uid:doc.fuid,type:'xiaobeike',num:(req.num*28/100).toFixed(2),increase:true},function(){
					//加日志
					Logs.addLog({uid:doc.fuid,type:1,msg:"获得"+req.uid+"用户"+(videoIndex+1)+"级小倍壳"+(req.num*28/100).toFixed(2)+"个"},function(){
						videoIndex++;
						fuid = doc.fuid;
						findFatherAndGiveGold()
					})
				})
			}else{
				//给父级加金币以及日志doc.fuid
				Users.changeRich({uid:doc.fuid,type:'xiaobeike',num:req.num*Config.ordinaryRule[startIndex],increase:true},function(){
					//加日志
					Logs.addLog({uid:doc.fuid,type:1,msg:"获得"+req.uid+"用户"+(startIndex+1)+"级小倍壳"+(req.num*Config.ordinaryRule[startIndex].toFixed(2))+"个"},function(){
						startIndex++;
						fuid = doc.fuid;
						findFatherAndGiveGold()
					})
				})
			}
		})
	}
	findFatherAndGiveGold();
}


//返佣写法 -> 机构  {uid：0,num:100}
distributionSchema.statics.senior = function(req,callback){
	var _this = this;
	var layer = Config.seniorRule.length;
	if(layer == 0){
		callback({code:0,msg:'未开放高级返佣'})
		return
	}
	var startIndex = 0;
	//暂存玩家ID
	var fuid = req.uid;
	function findAllFatherAndRealTo(){
		if(fuid == 0){
			callback({code:1,msg:'上级为0 高级返佣结束'})
			return;
		}
		_this.model('Distributions').findOne({uid:fuid},function(err,doc){
			if(fuid == req.uid){
				fuid = doc.fuid;
				findAllFatherAndRealTo();
			}else if(doc.lv == 0){
				startIndex++;
				fuid = doc.fuid;
				findAllFatherAndRealTo()
			}else{
				// 项目返佣
				if(req.formAddress == 'zlhz'){
					//加金币 日志 并继续执行
					Users.changeRich({uid:doc.uid,type:'gold',num:req.num*req.mechanismCom/100,increase:true},function(UserData){
						console.log("UserData:",UserData);
						Logs.addLog({uid:doc.uid,type:1,msg:"[SVIP]获得"+req.uid+"用户"+(startIndex+1)+"级佣金"+req.num/100*req.mechanismCom.toFixed(2)+"元"},function(){
							startIndex++;
							fuid = doc.fuid;
							findAllFatherAndRealTo();
						})
					})
				}else{
					//加金币 日志 并继续执行
					Users.changeRich({uid:doc.uid,type:'gold',num:req.num*Config.seniorRule[doc.lv-1],increase:true},function(){
						Logs.addLog({uid:doc.uid,type:1,msg:"[SVIP]获得"+req.uid+"用户"+(startIndex+1)+"级佣金"+req.num*Config.seniorRule[doc.lv-1].toFixed(2)+"元"},function(){
							startIndex++;
							fuid = doc.fuid;
							findAllFatherAndRealTo();
						})
					})
				}
			}
		})
	}
	findAllFatherAndRealTo()
}

// 判断是否机构vip
distributionSchema.statics.ifLvVip = function(req,callback){
	this.model('Distributions').findOne({uid:req.uid},function(err,doc){
		if(err){
			callback({code:0,msg:'网络原因，查询失败'});
		}else{
			if(doc.lv != 0){
				callback({code:1,msg:'此用户为机构vip'});
			}else{
				callback({code:0,msg:'此用户非机构vip'});
			}
		}
	})
}

distributionSchema.statics.setVip = function(req,callback){
	this.model('Distributions').update({uid:req.uid},{lv:req.type},function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}

distributionSchema.statics.getUserVip = function(req,callback){
	this.model('Distributions').findOne({uid:req.uid},['lv'],function(err,doc){
		err?callback({code:0}):callback({code:1,lv:doc.lv})
	})
}














































module.exports = Config.db.model('Distributions',distributionSchema);