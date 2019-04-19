//商店相关
var Config = require('./../config.js');

var userJob = require('./userJobList.js');
var User = require('./../runtimes/users.js');
var Log = require('./../runtimes/logs.js');

var Order = require('./userOrder.js');
var Car = require('./marketCar.js');

var marketSchema = new Config.mongoose.Schema({
	// 商品名称
	name: {type:String, default:''}, 
	// 商品作者
	uid: {type:String, default:''},
	// phone
	phone: {type:Number, default:''},
	// 商品图
	src: {type:String, default:''}, 
	//商品价格
	price: {type:Number, default:0}, 
	//商品介绍
	msg: {type:String, default:''}, 
	//商品详情
	other: {type:String, default:''}, 
	//商品图组
	otherArrar: {type:Array, default:[]}, 
	//商品库存
	num: {type:Number, default:0}, 
	//商家地址
	from: {type:String, default:'浙江杭州'}, 
	//发布权重
	strong: {type:Number, default:0}, 
	//积分价格
	score: {type:Number, default:88888888888888}, 
	// 金币+积分
	priceone: {type:Number, default:88888888888888}, 
	// 金币+积分
	scoreone: {type:Number, default:8888888888888}, 
	// 是否秒杀商品 0普通商品 1秒杀商品
	type:{type:String,default:'0'},
	// 成交量
	volume:{type:Number,default:0},
	// 商品上传时间
	uptime:{type:Number,default:new Date().getTime()}
})
// 下架单个商品
marketSchema.statics.downOneGood = function(params,callback){
	this.model('Markets').deleteOne({_id:params._id},function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'下架商品成功'});
	})
}

// 商家修改单个商品信息
marketSchema.statics.updateOneGoods = function(params,callback){
	this.model('Markets').findOneAndUpdate({_id:params._id},params.data,function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'修改成功',data:doc});
	})
}

// 获取商家商品
marketSchema.statics.findBosGoods = function(params,callback){
	var page = params.page;
	var pageValue = params.pageValue;
	this.model('Markets').find({uid:params.uid}).sort('-uptime').skip(page-1).limit(pageValue).exec(function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'获取成功',data:doc});
	})
}

// 查询二次兑换商品的所需积分
marketSchema.statics.findErCiScore = function(params,callback){
	this.model('Markets').findOne({_id:params.goodId},['score'],function(err,doc){
		err?callback({code:0,msg:'商品不存在'}):callback({code:1,score:doc.score});
	})
}

// 获取商品全部条数
marketSchema.statics.findMarketCount = function(req,callback){
	var pageValue = req.pageValue;
	this.model("Markets").find({strong:0},function(err,doc){
		err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:'查询成功',count:doc.length})
	})
},

// 根据商品id查询单个商品详细信息
marketSchema.statics.findGoodById = function(req, callback) {
	//这里的图片数组需要慎重考虑
	this.model('Markets').findOne({_id:req._id},function(err,doc){
		err?callback(err):callback(doc);
	})
}

//新建商品
marketSchema.statics.newGood = function(req, callback) {
	//这里的图片数组需要慎重考虑
	req.uptime = new Date().getTime();
	this.model('Markets').create(req, function(err, doc) {
		err?callback( {code:0, msg:'发布失败'}):callback( {code:1, msg:'发布成功'})
	})
}

//后台获取商品
marketSchema.statics.admGetGood = function(req, callback) {
	var pageValue = req.pageValue;
	this.model("Markets").find({strong:0}).skip((req.page-1)*pageValue).limit(pageValue).exec(function(err,doc){
		err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:'查询成功',data:doc})
	})
}

//App获取商品
marketSchema.statics.getGood = function(req, callback) {
	var pageValue = req.pageValue;
	this.model("Markets").find({strong:0},function(err,doc){
		err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:'查询成功',msg:doc.reverse()})
	})
}

marketSchema.statics.getBanner = function(req, callback) {
	this.model('Markets').findOne( {strong:8}, ['otherArrar'], function(err, doc) {
		callback( {code:1, msg:doc})
	})
}



// 查询购买商品所需积分，所需金币，所需积分+金币
marketSchema.statics.findPriceScore = function(req, callback) {
	var _this = this; 
	// 所接收的商品相关参数
	var orderList = req.order; 
	// 总价格
	var allPrice = 0; 
	// 总积分
	var allScore = 0; 
	// 总价格小
	var allPriceOne = 0; 
	// 总积分小
	var allScoreOne = 0; 
	// 判断是否存在此用户
	_this.model('Users').find( {uid:req.uid}, function(err, docs) {
		if (err) {
			callback( {code:0, msg:'账户异常'})
		}else {
			new Promise(function (res, rej) {
					for (var i = 0; i < orderList.length; i ++ ) {
						(function (_Id, index) {
							_this.model('Markets').findOne( {_id:_Id}, function(err, docs) {
								if (err) {
									callback({code:0, msg:'商品不存在'})
								}else {
									allPrice += docs.price * orderList[index].num; 
									allScore += docs.score * orderList[index].num; 
									allPriceOne += docs.priceone * orderList[index].num; 
									allScoreOne += docs.scoreone * orderList[index].num; 
									if (index == orderList.length-1) {res()}
								}
							})
						})(orderList[i]._id, i)	
					}	
			}).then(function () {
				// 先异步后传值
				callback({code:1, msg: {allPrice:allPrice, allScore:allScore, allPriceOne:allPriceOne, allScoreOne:allScoreOne}})
			})
		}
	})
}

// 余额购买商品
marketSchema.statics.buyGoods = function(req, callback) {
	var _this = this; 
	var uid = req.uid; 
	var order = req.order; 
	var address = req.address; 
	var username = address.name;
	var allPrice = 0; 
	var goodNameList = []; 
	var numList = []; 
	var goodIdList = []; 
	var srcList = []; 
	var orderIdList = [];
	var onceGoodPrice = [];
	var oldNum = [];
	var oldVolume = [];
	new Promise((res,rej) => {
		for(var i = 0;i<order.length; i++){
			orderIdList.push(order[i]._id)
			if(i == order.length - 1){
				res()
			}
		}
	}).then(() => {
		new Promise((res,rej) => {
			// 计算总价
			for (var i = 0; i < order.length; i++ ) {
				// 查询单个商品单价*数量
				(function (_Id, index) {
					_this.model('Markets').findOne({_id:_Id}, function(err, docs) {
						if (err) {
							callback( {code:0, msg:'服务器错误'})
							return
						}else {
							console.log('doc.num===================',docs.num)
							if(docs.num - order[index].num < 0 || docs.num == null){
								if(docs.num <= 0){
									callback({code:2,msg:'您所购买的'+docs.name+'商品已下架'});
								}else{
									callback({code:2,msg:'您所购买的'+docs.name+'商品数量超出库存量暂时无法购买'});
									return;
								}
							}else{
								// 获取当前成交量
								oldVolume.push(docs.volume)
								// 获取原来库存量
								oldNum.push(docs.num)
								// 为日志设置单个商品购买价格
								onceGoodPrice.push(docs.price * order[index].num)
								// 总价得出
								allPrice += docs.price * order[index].num
								// 获取商品名称
								goodNameList.push(docs.name)
								// 获取每个购买的商品的数量
								numList.push(order[index].num)
								// 获取每个商品的商品_id
								goodIdList.push(order[index]._id)
								// 获取每个商品缩略图
								srcList.push(docs.src)

								if(index == order.length - 1){
									res(docs.uid)
								}
							}
							
						}
					})
				})(order[i]._id, i)
			}}).then((bosuid) => {
				_this.model('Users').findOne( {uid:uid}, ['gold'], function(err, docs) {
					// 用户余额大于商品总价
					if (docs.gold >= allPrice) {
						// 扣除用户余额
						var newGold = docs.gold - allPrice; 
						_this.model('Users').updateOne({uid:uid},  {gold:newGold}, function(err, doc) {
							if (err) {
								callback( {code:0, msg:'服务器错误'})
							}else {
								// 循环生成用户日志并减少商品数量
								for (var i = 0; i < goodNameList.length; i++ ) {
									// 循环闭包
									(function (index) {
										// 减少商品数量
										var newNum = oldNum[index] - numList[index];
										var newvolume = oldVolume[index] + numList[index];
										_this.model('Markets').updateOne({_id:goodIdList[index]},{num:newNum,volume:newvolume},function(err,docss){
											if(err){
												callback({code:0,msg:'服务器错误'})
											}else{
												// 生成用户日志
												Log.addLog({uid:uid, type:2, msg:'购买商品[' + goodNameList[index] + '] * ' + numList[index] + '花费' + onceGoodPrice[index] + '元'}, function(data) {
													//继续下一步
													Order.newOrder({
														goodId:goodIdList[index], 
														src:srcList[index], 
														num:numList[index], 
														uid:uid, 
														time:Date.now(), 
														address:address.address, 
														phone:address.phone,
														msg:address.msg,
														username:username,	
														goodname:goodNameList[index], 
														bosuid:bosuid,
														erci:false
													}, function(data) {
														if (index == goodNameList.length - 1) {
															// 判断是否从购物车购买  type = 0;
															var delCarList = {"uid":uid,data:orderIdList}
															if(order[0].type == 0){
																Car.delCar(delCarList,function(data){
																	if(data.code == 1){
																		callback({code:1,msg:'购买成功'})
																	}else{
																		callback({code:0,msg:'服务器错误，购买失败。'})
																	}
																})
															}else{
																callback(data)
															}
														}
													})
												})
											}
										})
									})(i)
								}
							}
						})
					}else {
						callback( {code:0, msg:'余额不足，请进行充值'})
					}
				})
			})
	}).catch(() => {
		callback({code:0,msg:'操作过快'})
	})

}


//积分购买
marketSchema.statics.buyGoodByScore = function(req, callback) {
	var _this = this; 
	var uid = req.uid; 
	var order = req.order; 
	var address = req.address; 
	var username = address.name;
	var allScore = 0; 
	var goodNameList = []; 
	var numList = []; 
	var goodIdList = []; 
	var srcList = []; 
	var orderIdList = [];
	var onceGoodScore = [];
	var oldNum = [];
	var oldVolume = [];
	new Promise((res,rej) => {
		for(var i = 0;i<order.length; i++){
			orderIdList.push(order[i]._id)
			if(i == order.length - 1){
				res()
			}
		}
	}).then(() => {
		new Promise((res,rej) => {
			// 计算总积分
			for (var i = 0; i < order.length; i++ ) {
				// 查询单个商品积分*数量
				(function (_Id, index) {
					_this.model('Markets').findOne( {_id:_Id}, function(err, docs) {
						if (err) {
							callback({code:0, msg:'服务器错误'})
							return
						}else {
							if(docs.num - order[index].num < 0 ){
								if(docs.num <= 0){
									callback({code:2,msg:'您所购买的'+docs.name+'商品已下架'});
								}else{
									callback({code:2,msg:'您所购买的'+docs.name+'商品数量超出库存量暂时无法购买'});
									return;
								}
							}else{
								// 获取当前成交量
								oldVolume.push(docs.volume)
								// 获取原来库存量
								oldNum.push(docs.num)
								// 为日志设置单个商品购买积分
								onceGoodScore.push(docs.score * order[index].num)
								// 总积分得出
								allScore += docs.score * order[index].num
								// 获取商品名称
								goodNameList.push(docs.name)
								// 获取每个购买的商品的数量
								numList.push(order[index].num)
								// 获取每个商品的商品_id
								goodIdList.push(order[index]._id)
								// 获取每个商品缩略图
								srcList.push(docs.src)

								if(index == order.length - 1){
									res(docs.uid)
								}
							}
						}
					})
				})(order[i]._id, i)
			}
		}).then((bosuid) => {
			_this.model('Users').findOne( {uid:uid}, ['score'], function(err, docs) {
				// 用户总积分能买得起
				if (docs.score >= allScore) {
					// 扣除用户积分
					var newScore = docs.score - allScore; 
					_this.model('Users').updateOne( {uid:uid},  {score:newScore}, function(err, doc) {
						if (err) {
							callback( {code:0, msg:'服务器错误'})
						}else {
							// 循环生成用户日志并减少商品数量
							for (var i = 0; i < goodNameList.length; i++ ) {
								// 循环闭包
								(function (index) {
								// 减少商品数量
								var newNum = oldNum[index] - numList[index];
								var newvolume = oldVolume[index] + numList[index];
								_this.model('Markets').updateOne({_id:goodIdList[index]},{num:newNum,volume:newvolume},function(err,docss){
									if(err){
										callback({code:0,msg:'服务器错误'})
									}else{
										Log.addLog( {uid:uid, type:2, msg:'购买商品[' + goodNameList[index] + '] * ' + numList[index] + '花费' + onceGoodScore[index] + '积分'}, function(data) {
										//继续下一步
										Order.newOrder({
											goodId:goodIdList[index], 
											src:srcList[index], 
											num:numList[index], 
											uid:uid, 
											time:Date.now(), 
											address:address.address, 
											phone:address.phone,
											msg:address.msg,
											username:username,	
											goodname:goodNameList[index], 
											bosuid:bosuid,
											erci:true
										},function(data) {
											console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
											if (index == goodNameList.length - 1) {
												// 判断是否从购物车购买  type = 0;
												var delCarList = {"uid":uid,data:orderIdList}
												if(order[0].type == 0){
													Car.delCar(delCarList,function(data){
														if(data.code == 1){
															callback({code:1,msg:'购买成功'})
														}else{
															callback({code:0,msg:'服务器错误，购买失败。'})
														}
													})
												}else{
													callback(data);
													return;
												}
											}
										})
									})}
								})
								})(i)
							}
						}
					})
				}else {
					callback( {code:0, msg:'余额不足，请进行充值'})
				}
			})
		})
	}).catch(() => {
		callback({code:0,msg:'操作过快'})
	})
}


// 余额+积分购买
marketSchema.statics.pricePlusScore = function(req,callback){
	var _this = this; 
	var uid = req.uid; 
	var order = req.order; 
	var address = req.address; 
	var username = address.name; 
	var allScoreOne = 0; 
	var allPriceOne = 0; 
	var goodNameList = []; 
	var numList = []; 
	var goodIdList = []; 
	var srcList = []; 
	var orderIdList = []; 
	var onceGoodPriceOne = []; 
	var onceGoodScoreOne = []; 
	var oldNum = [];
	var oldVolume = [];
	new Promise((res,rej) => {
		for(var i = 0;i<order.length; i++){
			orderIdList.push(order[i]._id)
			if(i == order.length - 1){
				res()
			}
		}
	}).then(() => {
		new Promise((res,rej) => {
			// 计算总积分
			for (var i = 0; i < order.length; i++ ) {
				// 查询单个商品积分*数量
				(function (_Id, index) {
					_this.model('Markets').findOne( {_id:_Id}, function(err, docs) {
						if (err) {
							callback({code:0, msg:'服务器错误'})
							return
						}else {
							if(docs.num - order[index].num < 0 ){
								if(docs.num <= 0){
									callback({code:2,msg:'您所购买的'+docs.name+'商品已下架'});
								}else{
									callback({code:2,msg:'您所购买的'+docs.name+'商品数量超出库存量暂时无法购买'});
									return;
								}
							}else{
								// 获取当前成交量
								oldVolume.push(docs.volume)
								// 获取原来库存量
								oldNum.push(docs.num)
								// 为日志设置单个商品购买积分
								onceGoodScoreOne.push(docs.scoreone * order[index].num)
								// 为日志设置单个商品购买余额
								onceGoodPriceOne.push(docs.priceone * order[index].num)
								// 总积分得出
								allScoreOne += docs.scoreone * order[index].num
								// 总余额得出
								allPriceOne += docs.priceone * order[index].num
								// 获取商品名称
								goodNameList.push(docs.name)
								// 获取每个购买的商品的数量
								numList.push(order[index].num)
								// 获取每个商品的商品_id
								goodIdList.push(order[index]._id)
								// 获取每个商品缩略图
								srcList.push(docs.src)

								if(index == order.length - 1){
									res(docs.uid)
								}
							}
						}
					})
				})(order[i]._id, i)
			}
		}).then((bosuid) => {
			_this.model('Users').findOne({uid:uid}, ['score','gold'], function(err, docs) {
				// 用户总积分能买得起
				if (docs.score >= allScoreOne&&docs.gold >= allPriceOne) {
					// 扣除用户积分
					var newScore = docs.score - allScoreOne; 
					var newPrice = docs.gold - allPriceOne;
					_this.model('Users').updateMany( {uid:uid},  {score:newScore,gold:newPrice}, function(err, doc) {
						if (err) {
							callback( {code:0, msg:'服务器错误'})
						}else {
							// 循环生成用户日志并减少商品数量
							for (var i = 0; i < goodNameList.length; i++ ) {
								// 循环闭包
								(function (index) {
								// 减少商品数量
								var newNum = oldNum[index] - numList[index];
								var newvolume = oldVolume[index] + numList[index];
								_this.model('Markets').updateOne({_id:goodIdList[index]},{num:newNum,volume:newvolume},function(err,docss){
									if(err){
										callback({code:0,msg:'服务器错误'})
									}else{
										Log.addLog( {uid:uid, type:2, msg:'购买商品[' + goodNameList[index] + '] * ' + numList[index] + '花费' + onceGoodPriceOne[index] + '余额'+ onceGoodScoreOne[index] + '积分'}, function(data) {
										//继续下一步
										Order.newOrder({
											goodId:goodIdList[index], 
												src:srcList[index], 
												num:numList[index], 
												uid:uid, 
												time:Date.now(), 
												address:address.address, 
												phone:address.phone,
												msg:address.msg,
												username:username,	
												goodname:goodNameList[index], 
												bosuid:bosuid,
												erci:false
										}, function(data) {
											if (index == goodNameList.length - 1) {
												// 判断是否从购物车购买  type = 0;
												var delCarList = {"uid":uid,data:orderIdList}
												if(order[0].type == 0){
													Car.delCar(delCarList,function(data){
														if(data.code == 1){
															callback({code:1,msg:'购买成功'})
														}else{
															callback({code:0,msg:'服务器错误，购买失败。'})
														}
													})
												}else{
													callback(data)
												}
											}
										})
									})}
								})
								})(i)
							}
						}
					})
				}else {
					callback( {code:0, msg:'余额不足，请进行充值'})
				}
			})
		}).catch(() => {
			callback({code:0,msg:'操作过快'})
		})
	})
}



//获取公告
marketSchema.statics.getNotice = function(req, callback) {
	this.model('Markets').findOne( {strong:8}, ['msg'], function(err, doc) {
		callback( {code:1, msg:doc.msg})
	})
}



var Market = Config.db.model('Markets', marketSchema); 

module.exports = Market