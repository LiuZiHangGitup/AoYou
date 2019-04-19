//用户提现表
var Config = require('./../config.js')

var Users = require('./../runtimes/users.js')
var Card = require('./../runtimes/userCards.js')
var datas = require('./../businessLogic/datas.js')



var cashSchema = new Config.mongoose.Schema({
	//用户ID
	uid:{type:Number,default:0},
	_uid:{type:String,default:""},
	//提现金额
	num:{type:Number,default:0},
	//提现用户
	truename:{type:String,default:""},
	//提现账号
	cashCard:{type:String,default:""},
	//0未受理 1通过  2拒绝  3异常
	type:{type:Number,default:0},

	msg:{type:String,default:""},
	//发起时间
	createTime:{type:Number,default:0},
	//受理时间
	acceptTime:{type:Number,default:0}
})

cashSchema.statics.newCash = function(data,callback){
	data.createTime = Date.now()
	var _this = this
	//先看玩家货币及小倍壳是否足够提现
	this.model('Users').findOne({uid:data.uid},["gold","lv","xiaobeike"],function(err,doc){
		if(doc){
			// 判断是不是第一次提现
			Card.getCard({uid:data.uid},function(doc2){
				//看看绑卡信息
				if(doc2.data.realname==''||doc2.data.cashCard == ''||doc2.data.realname.length<2||doc2.data.cashCard.length<5){
					callback({code:0,msg:'请完善绑卡信息'})
				}else{
					//判断余额够不够
					if(doc.gold >= data.num){
						// 继续判断小倍壳够不够
						datas.findBeiKeJia({},function(beiKeJiaData){
							if(beiKeJiaData.code == 1){
								var kaipanjia = beiKeJiaData.kaipanjia;
								// 计算要扣除的小倍壳
								var kouBeiKe = parseFloat(num/100*kaipanjia*5/100).toFixed(2);
								if(doc.xiaobeike >= kouBeiKe){
									//是会员
									//小视频提现需要更改lv，临时设置为doc.lv>=0，取消了非会员提现
									if(doc.lv>=0){
										if(data.num!=0&&data.num%50==0){
											toCash(data.num,doc2.data.realname,doc2.data.cashCard)
										}else{
											callback({code:0,msg:'提现需为50元倍数'})
										}
									}else if(doc.lv==0&&doc2.data.cardnumber==0){
										//非会员首次提现 2元
										if(data.num>2){
											callback({code:0,msg:'非会员体验提现限额2元'})
										}else{
											//更新
											_this.model('Cards').updateOne({uid:data.uid},{cardnumber:1},function(){
												toCash(data.num,doc2.realname,doc2.cashCard,kouBeiKe)
											})
										}
									}else{
										//非会员多次提现
										callback({code:0,msg:'成为会员可发起提现'})
									}
								}else{
									callback({code:0,msg:'小倍壳数量不足,请前往购买'});
									return;
								}
							}else{
								callback({code:0,msg:'网络错误'});
								return;
							}
						})
					}else{
						callback({code:0,msg:'余额不足'})
					}
				}
			})


			//提现操作
			function toCash(num,realname,cashcard,yaoKouBeiKe){
				//减去余额
				doc.gold -= num;
				doc.xiaobeike -=yaoKouBeiKe;
				doc.save(function(err,doc){
					if(err){
						callback({code:0,msg:'申请异常'});
						return;
					}else{
						data.truename = realname;
						data.cashCard = cashcard;
						console.log("体现参数========",data)
						_this.model('Cashes').create(data,function(err,doc){
							callback({code:1,msg:'发起成功'})
						})
					}
				})
			}
		}else{
			callback({code:0,msg:'异常操作'})
		}
	})
}

//获取记录
cashSchema.statics.cashLogs = function(data,callback){
	this.model('Cashes').find({uid:data.uid}).sort('-createTime').exec(function(err,doc){
		callback({code:1,msg:'获取成功',data:doc})
	})
}

// 获取体现总条数
cashSchema.statics.getCashCount = function(data,callback){
	var xh;
	if(data.index == 0){
		xh = {}
	}else if(data.index == 1){
		xh = {type:1}
	}else if(data.index == 2){
		xh = {type:2}
	}else if(data.index == 3){
		xh = {type:0}
	}else if(data.index == 4){
		xh = {uid:Number(data.sarch)}
	}else if(data.index == 5){
		xh = {cashCard:data.sarch}
	}
	var _this = this
	_this.model("Cashes").find(xh,function(err,doc){
		err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:'查询成功',count:doc.length})
	})
}

//管理员
cashSchema.statics.getCashList = function(data,callback){
	var xh;
	if(data.index == 0){
		xh = {}
	}else if(data.index == 1){
		xh = {type:1}
	}else if(data.index == 2){
		xh = {type:2}
	}else if(data.index == 3){
		xh = {type:0}
	}else if(data.index == 4){
		xh = {uid:Number(data.sarch)}
	}else if(data.index == 5){
		xh = {cashCard:data.sarch}
	}

	var _this = this
	var pageValue = data.pageValue;
	this.model('Cashes').find(xh).sort('-time').skip((data.page-1)*pageValue).limit(pageValue).exec(function(err,doc){
		if(doc){
			if(doc.length == 0){
				callback({code:1,data:[]})
				return
			}
			var soft = doc;
			var index = 0;
			var softData = [];
			var doneLength = doc.length
			function loadGold(){
				_this.model('Users').findOne({uid:soft[index].uid},['allpay','allcash'],function(err,doc){
					if(err){
						callback({code:0,msg:'获取失败'})
					}else{
						var item = {
							uid: soft[index].uid,
						    _uid: soft[index]._id,
						    num: soft[index].num,
						    truename: soft[index].truename,
						    cashCard: soft[index].cashCard,
						    type: soft[index].type,
						    msg: soft[index].msg,
						    createTime:soft[index].createTime,
						    acceptTime: soft[index].acceptTime,
						    _id: soft[index]._id,
						    allpay:doc.allpay,
						    allcash:doc.allcash,
						    __v: 0 
						}
						softData.unshift(item)
						if(index == doneLength-1){
							callback({code:1,data:softData})
						}else{
							index++
							loadGold()
						}
					}
				})
			}
			loadGold()
		}else{
			callback({code:0})
		}
	})
}

cashSchema.statics.passOrder = function(res,callback){
	this.model('Cashes').findOne({_id:res._id},function(err,doc){
		if(doc){
			if(res.code == 1){

				doc.type = 1
				doc.msg = '审批通过'
				doc.acceptTime = Date.now()

			}else if(res.code == 0){

				doc.type = 2
				doc.msg = res.msg
				doc.acceptTime = Date.now()

			}

			doc.save(function(err,doc){
				if(doc){
					if(res.code == 1){
						callback({code:1,msg:'审批通过',type:1})
						//玩家的allout字段
						Users.changeAllout({uid:doc.uid,num:doc.num},function(data){
						})
					}else{
						Users.changeRich({uid:doc.uid,type:'gold',num:doc.num,increase:true},function(data){
							callback({code:1,msg:'审批拒绝',type:2})
						})
					}
				}else{
					callback({code:0,msg:'处理异常'})
				}
			})
		}else{
			callback({code:0,msg:'单号错误'})
		}
	})


}







module.exports = Config.db.model('Cashes',cashSchema);