//任务相关
var Config = require('./../config.js')

var userJob = require('./userJobList.js')
var User = require('./../runtimes/users.js')
var Log = require('./../runtimes/logs.js')
var fs = require('fs')

var jobSchema = new Config.mongoose.Schema({
	//数据信息 可以是文本和图片路径
	value:{type:String,default:''},
	//佣金
	reward:{type:Number,default:0},
	//任务发行量
    count:{type:Number,default:1000},
    //专属任务 0基础任务  1会员任务 2高级会员任务
    vipjob:{type:Number,default:0},
    //已经被执行多少次
    sort:{type:Number,default:0},
    //任务类型  txt img page obj
    type:{type:String,default:''},
    //主要是网页分享的信息
    title:{type:String,default:''},
    //网页的标志
    ico:{type:String,default:''},
    //预留
    text:{type:String,default:''},
    //是否开放
    stu:{type:Boolean,default:true},
    //任务权重
    strong:{type:Number,default:0},
    //上架时间
    time:{type:Number,default:0},
    //任务发布者 _id
    promulgato:{type:String,default:'admin'},
    //发布者 user / admin
    author:{type:String,default:'admin'},
    //发布者ID
    uid:{type:Number,default:0}
})



//新建上架
jobSchema.statics.newJob = function(req,callback){
	req.time = Date.now()
	this.model('Jobs').create(req,function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}

//删除任务
jobSchema.statics.delJob = function(req,callback){
	this.model('Jobs').remove({_id:req._id},function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}

//获取任务
jobSchema.statics.getJob = function(res,callback){
	this.model('Jobs').find({stu:true}).sort('-time').exec(function(err,doc){
		err?callback({code:0}):callback({code:1,data:doc})
	})
}

//Admin获取任务
jobSchema.statics.adminGetJob = function(req,callback){
	var xh = {}
	if(req.s == 'all'){
		this.model('Jobs').find({}).sort('-time').exec(function(err,doc){
			err?callback({code:0}):callback({code:1,data:doc})
		})
	}else{
		this.model('Jobs').find({type:req.type}).sort('-time').exec(function(err,doc){
			err?callback({code:0}):callback({code:1,data:doc})
		})
	}
	
}

//执行任务
jobSchema.statics.doneJob = function(req,callback){
	//看看用户有没有执行这个任务
	var _this = this;
	userJob.cutJob(req,function(res){
		//  if(res.code == 0){
		// 	callback({code:0,msg:'12小时重复执行任务不会获得奖励'})
		 //}else{
			//判断一下身份是不是可以接这个任务
			_this.model('Users').findOne({uid:req.uid},function(ed,dd){
				if(dd.todayJob>=Config.jobRule[dd.lv]){
					callback({code:0,msg:'今日执行任务已达上限,不再获得佣金奖励'})
				}
				else{
					_this.model('Jobs').findOne({_id:req.jobId},function(err,doc){
						if(doc){
							if(doc.sort>=doc.count){
								callback({code:0,msg:'任务已达上限'})
								doc.stu = false;
								doc.save()
								return;
							}
							//判断任务是否符合
							if(dd.lv>=doc.vipjob){
								var soft = {
									uid:req.uid,
									jobId:req.jobId,
									done:true,
									time:Date.now(),
									jobname:req.title,
									jobRich:doc.reward,
									class:req.class
								}
								userJob.newJob(soft,function(data){
									if(data.code == 1){
										//加金币
										//加日志
										Log.addLog({uid:req.uid,type:2,msg:'【'+doc.title+'】任务完成'},function(data){
											if(data.code == 1){
												callback({code:1,msg:'任务完成'})
												//更新数量
												_this.model('Jobs').update({_id:req.jobId},{$inc:{sort:1}},function(err,doc){
													dd.todayJob++;
													dd.save(function(){
													})
												})
											}
										})
									}
								})
							}else{
								callback({code:0,msg:'执行失败,跨级执行高阶任务'})
							}
							
						}else{
							callback({code:0,msg:'任务异常'})
						}
					})
				}
			})
			
		//}
	})
}


jobSchema.statics.updateJob = function(req,callback){
	var _this = this
	//先判断自己的小倍壳够不够
	this.model('Users').findOne({uid:req.uid},function(err,doc){
		//获取所需金额
		var allXiaoBeiKe = parseFloat(req.data.count*req.data.reward/100).toFixed(2);
		if(doc.xiaobeike >= allXiaoBeiKe){
				//其他两种不需要保存图片这一步
				_this.model('Jobs').create(req.data,function(err,doc){
					//减去金币
					if(err){
						callback({code:102,msg:'发布失败'});
						return;
					}

					User.changeRich({uid:req.uid,type:'xiaobeike',num:allXiaoBeiKe,increase:false},function(data){
						if(data.code == 1){
							//添加日志
							Log.addLog({uid:req.uid,type:2,msg:'任务发布小倍壳-'+allXiaoBeiKe+'个'},function(data){

							})
							callback({code:1,msg:'任务发布成功'})
						}
					})
				})
		}else{
			callback({code:0,msg:'小倍壳不足,任务发布失败'})
		}
	})


	
}


































module.exports = Config.db.model('Jobs',jobSchema);
