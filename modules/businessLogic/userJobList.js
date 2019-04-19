//用户任务相关
var Config = require('./../config.js')

// var Users = require('./../runtimes/users.js')
var Log = require('./../runtimes/logs.js')
var fs = require('fs')

var userJobSchema = new Config.mongoose.Schema({
	//用户ID
    uid:{type:Number,default:0},
    //任务ID
    jobId:{type:String,default:''},
    //完成状态
    done:{type:Boolean,default:true},
    //扩展 0待审核 1通过 2拒绝
    type:{type:Number,default:0},
    //msg 拒绝原因
    msg:{type:String,default:''},
    //任务时间
    time:{type:Number,default:Date.now()},
    // 任务名称
    jobname:{type:String,default:''},
    //佣金
    jobRich:{type:Number,default:0},
    //截图
    screen:{type:String,default:''},
    //类型 txt img page
    class:{type:String,default:''}
})

//新建任务
userJobSchema.statics.newJob = function(req,callback){
    req.time = Date.now();
    this.model('Userjobs').create(req,function(err,doc){
        err?callback({code:0}):callback({code:1,data:doc})
    })
}

//24小时限制
userJobSchema.statics.cutJob = function(req,callback){
    this.model('Userjobs').find({uid:req.uid,jobId:req.jobId}).sort('-time').exec(function(err,doc){
        if(doc.length == 0){
            callback({code:1})
        }else{
            if(doc[0].time+12*60*60*1000 > Date.now()){
                callback({code:0})
            }else{
                callback({code:1})
            }
        }
    })
}

//更改任务状态
userJobSchema.statics.okJob = function(req,callback){
    this.model('Userjobs').update({uid:req.uid,_id:req._id},{done:true},function(err,doc){
        if(err){
            callback({code:0,msg:'任务异常'})
        }else{
            //加金币
            callback({code:1})
        }
    })
}


// 获取用户完成量以及任务总收益
userJobSchema.statics.getCount = function(callback){
    this.model('Userjobs').find({},function(err,doc){
        var result = new Object()
        result.jobCount = doc.length
        result.goldCount = 0
        for(var i = 0;i<doc.length;i++){
            result.goldCount += doc[i].jobRich
        }
        callback({code:1,data:result})
    })
}

//玩家获取自己的任务表 uid
userJobSchema.statics.getMyJob = function(req,callback){
    this.model('Userjobs').find({uid:req.uid}).sort('-time').exec(function(err,doc){
        err?callback({code:0}):callback({code:1,data:doc})
    })
}

//玩家上传自己的任务截图 {uid,img,jonId}
userJobSchema.statics.updateImg = function(req,callback){
    var _this = this;
    var imgData = req.img;
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var imgName = req.uid+'-'+Date.now()+'-'+req.jobId
    fs.writeFile('./public/images/screens/'+imgName+".png", dataBuffer, function(err) {
        if(err){
            callback({code:0,msg:'上传失败'})
        }else{
            _this.model('Userjobs').update({_id:req.jobId,uid:req.uid},{screen:'images/screens/'+imgName+".png"},function(err,doc){
                err?callback({code:0}):callback({code:1,msg:'上传成功,等待审核',src:'images/screens/'+imgName+".png"})
            })
        }
    })
}

//优化上传截图 {uid _id src}
userJobSchema.statics.updateImgHref = function(req,callback){
    this.model('Userjobs').update({_id:req._id,uid:req.uid},{screen:req.src,time:Date.now()},function(err,doc){
        err?callback({code:0}):callback({code:1,msg:'上传成功,等待审核'})
    })
}

userJobSchema.statics.getScreenCount = function(req,callback){
    this.model('Userjobs').find({},function(err,docs){
        err?callback({code:0,msg:'获取任务总条数失败'}):callback({code:1,msg:docs.length})
    })
}

userJobSchema.statics.getScreen = function(req,callback){
    var pageValue = req.pageValue;
    this.model("Userjobs").find({}).sort('-time').skip((req.page)*pageValue).limit((pageValue)).exec(function(err,doc){
        err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:'查询成功',data:doc})
    })
}


//处理截图认证 {_id,stu}
userJobSchema.statics.disJob = function(req,callback){
    var _this = this;
    this.model('Userjobs').findOne({_id:req._id},function(err,doc){
        if(err){
            callback({code:0,msg:'请求失败'})
        }else{
            if(doc.type != 0){
                callback({code:0,msg:'异常操作'})
                return
            }
            doc.type = req.stu
        }
        doc.save(function(){
            if(req.stu == 1){
                //金币 日志
                var Users = require('./../runtimes/users.js')
                console.log("Users:",Users);
                Users.changeRich({uid:doc.uid,type:'xiaobeike',num:doc.jobRich,increase:true},function(res){
                    if(res.code == 1){
                        //加日志
                        Log.addLog({uid:doc.uid,type:2,msg:'【'+doc.jobname+'】任务审核通过奖励'+doc.jobRich+'小倍壳'},function(data){
                            if(data.code == 1){
                                callback({code:1,msg:'操作完成'})
                                //更新数量
                                _this.model('Jobs').update({_id:req._id},{$inc:{sort:1}},function(err,doc){
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}

module.exports = Config.db.model('Userjobs',userJobSchema);