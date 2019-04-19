//用户相关
var Config = require('./../config.js');

var crypto = require('crypto');

var _Wearhouse = require('./wearhouse.js');
var _Logs = require('./logs.js');
var _Card = require('./userCards.js');
var _Distribution = require('./relation.js');
var _Phonecode = require('./phoneCode.js');
var Video = require('../businessLogic/video.js');
var ddzGrade = require('../businessLogic/ddzGrade.js');
var datas = require('../businessLogic/datas.js');
var xiaoBeiKeOrder = require('../businessLogic/xiaoBeiKeOrder.js');
var userOrder = require('../businessLogic/userOrder.js');
var Markets = require('../businessLogic/market.js');
var YlhFanXian = require('../businessLogic/ylhFanXian.js');
//测试API
// var Api = require('../ApiTest.js')

var userSchema = new Config.mongoose.Schema({
	//用户手机号
	username:{type:Number,default:0},
	//用户密码
	password:{type:String,default:''},
	//用户支付密码
	paypwd:{type:Number,default:0},
	//用户ID
	uid:{type:Number,default:0},
	//用户昵称
	nickname:{type:String,default:''},
	//推荐码
	invitationCode:{type:String,default:''},
	//设备码
	deviceCode:{type:String,default:''},
	//用户一级货币
	gold:{type:Number,default:0},
	//用户二级货币
	diamond:{type:Number,default:0},
	//用户三级货币
	score:{type:Number,default:0},
	//用户等级
	lv:{type:Number,default:0},
	fuid:{type:Number,default:0},
	//用户头像
	avatar:{type:String,default:''},
	//封号时间 Date.now()+100000000
	frozen:{type:Number,default:0},
	//登录次数
	loginTimes:{type:Number,default:0},
	//注册时间
	regTime:{type:Number,default:0},
	//存储执行任务数
	todayJob:{type:Number,default:0},
	//累计充值
	allpay:{type:Number,default:0},
	//累计提现
	allcash:{type:Number,default:0},
	//最近一次登录时间
	lastLoginTime:{type:Number,default:0},
	//session
	usession:{type:String,default:''},
	// IFCANSHOWVIDEO
	ifcanshowvideo:{type:String,default:'false'},
	// 可观看的所有视频
	canshowvideo:{type:Array,default:[]},
	// 是否同意战略合作协议书
	zlhzstu:{type:Boolean,default:false},
	// 斗地主级别
	ddzgrade:{type:Number,default:0},
	// 查询小倍壳数量
	xiaobeike:{type:Number,default:0},
	// 是否上传个人信息 0未上传 1上传未通过 2已通过
	userinformationstate:{type:Number,default:0},
	// 今天已卖出的小倍壳的个数
	todaysellbeike:{type:Number,default:0},
	// 最后一次卖出小倍壳的时间
	sellbeiketime:{type:Number,default:new Date().getTime()},
	// 易廉惠返现
	ylhfanyong:{type:Number,default:0}
})

// 每天进行返现
userSchema.statics.dayYlhFanXian = function(params,callback){
	var biLi = 0,fanXianList = [],indexCount = 0,uid = params.uid,nowTime = new Date().getTime(),allAddPrice = 0,_this = this;
	// 首先查询返现比例
	datas.findYlhFanXian({},function(datasData){
		if(datasData.code == 1){
			biLi = datasData.num;
			// 获取此用户的所有返现记录
			YlhFanXian.findUserAllFanXian({uid:uid},function(fanXianData){
				if(fanXianData.code == 1){
					fanXianList = fanXianData.data;
					fanXian();
					function fanXian(){
						if(indexCount == fanXianList.length){
							_this.model('Users').findOne({uid:uid},['gold','ylhfanyong'],function(erra,doca){
								if(erra){
									callback({code:0,msg:'网络错误'});
									return;
								}else{
									doca.gold = (parseFloat(doca.gold) + parseFloat(allAddPrice)).toFixed(2);
									if(doca.ylhfanyong == undefined || doca.ylhfanyong == null){
										doca.ylhfanyong = parseFloat(allAddPrice).toFixed(2);
									}else{
										doca.ylhfanyong = (parseFloat(doca.ylhfanyong) + parseFloat(allAddPrice)).toFixed(2);
									}
									doca.save(function(errb,docb){
										if(errb){
											callback({code:0,msg:'网络错误'});
											return;
										}else{
											callback({code:1,msg:'返现成功'});
											return;
										}
									})
								}
							})
						}else{
							var chaTime = parseInt(nowTime - fanXianList[indexCount].lasttime);
							var chaDay = parseInt(fanXianList[indexCount].allday - fanXianList[indexCount].haveday);
							if(chaTime > 86400000&&chaDay > 0){
								// 差几天
								var ciShu = parseInt(chaTime/86400000);
								// 计算出此订单应增加的钱数
								if(ciShu > chaDay){
									ciShu = chaDay;
								}
								var addNum = parseFloat((fanXianList[indexCount].allprice*biLi/1000)*ciShu);
								allAddPrice = (parseFloat(allAddPrice) + parseFloat(addNum)).toFixed(2);
								var allHaveDay = parseInt(fanXianList[indexCount].haveday) + ciShu;
								YlhFanXian.addHaveDay({_id:fanXianList[indexCount]._id,haveday:allHaveDay},function(addHaveDayData){
									if(addHaveDayData.code == 1){
										indexCount++;
										fanXian();
									}else{
										callback({code:0,msg:'网络错误'});
										return;
									}
								})
							}else{
								indexCount++;
								fanXian();
							}
						}
					}
				}else{
					callback({code:0,msg:'网络错误'});
					return;
				}
			})
		}else{
			callback({code:0,msg:'网络错误'});
			return;
		}
	})
}

// 当时间大于第二天时清空已购买小倍壳
userSchema.statics.clearTodaySellBeike = function(params,callback){
	var _this = this;
	_this.model('Users').findOne({uid:params.uid},['sellbeiketime','todaysellbeike'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误'});
			return;
		}else{
			if(doc == null || doc == undefined){
				doc.todaysellbeike = 0;
				doc.sellbeiketime = 0;
				doc.save(function(erra,doca){
					erra?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'重置当天小倍壳可购买数量成功'});
					return;
				})
			}else{
				var nowYear = new Date().getFullYear();
				var userYear = new Date(doc.sellbeiketime).getFullYear();
				var nowMonth = new Date().getMonth();
				var userMonth = new Date(doc.sellbeiketime).getMonth();
				var nowDate = new Date().getDate();
				var userDate = new Date(doc.sellbeiketime).getDate();

				if(nowYear > userYear){
					doc.todaysellbeike = 0;
					doc.save(function(erra,doca){
						erra?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'重置当天小倍壳可卖出数量成功'});
						return;
					})
				}else{
					if(nowMonth > userMonth){
						doc.todaysellbeike = 0;
						doc.save(function(erra,doca){
							erra?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'重置当天小倍壳可卖出数量成功'});
							return;
						})
					}else{
						if(nowDate > userDate){
							doc.todaysellbeike = 0;
							doc.save(function(erra,doca){
								erra?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'重置当天小倍壳可卖出数量成功'});
								return;
							})
						}else{
							doc.save(function(erra,doca){
								erra?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'当日已重置一次小倍壳'});
								return;
							})
						}
					}
				}
			}
			
		}
	})
}

// 修改用户小倍壳数量
userSchema.statics.reduceXiaoBeiKe = function(params,callback){
	var _this = this;
	_this.model('Users').updateOne({uid:params.uid},{xiaobeike:params.num},function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'减少成功'});
	})
}

// 判断用户斗地主等级是否为7级
userSchema.statics.userDdzgrade = function(params,callback){
	this.model('Users').findOne({uid:params.uid},['ddzgrade'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误'});
			return;
		}else{
			if(doc.ddzgrade >= 7){
				callback({code:1,msg:'可以进行其他操作'});
				return;
			}else{
				callback({code:0,msg:'请先充值到国士无双等级。'});
				return;
			}
		}
	})
}

// 修改上传个人信息状态
userSchema.statics.updateUserInformation = function(params,callback){
	this.model('Users').updateOne({uid:params.uid},{userinformationstate:parseFloat(params.state)},function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'修改成功'});
	})
}

// 查询是否上传个人信息
userSchema.statics.ifInfomation = function(params,callback){
	this.model('Users').findOne({uid:params.uid},['userinformationstate'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误'});
			return;
		}else{
			console.log("userinformationstate:",doc.userinformationstate)
			if(doc == undefined||doc == null ||doc.userinformationstate == undefined || doc.userinformationstate == null){
				callback({code:1,msg:'暂未上传，请上传个人信息'});
			}else{
				if(doc.userinformationstate == 0){
					callback({code:1,msg:'暂未上传，请上传个人信息'});
				}else if(doc.userinformationstate == 1){
					callback({code:2,msg:'请耐心等待审核'});
				}else if(doc.userinformationstate == 2){
					callback({code:3,msg:'可以进入'});
				}
			}
		}
	})
}

// 积分兑换余额
userSchema.statics.pushJiFen = function(params,callback){
	var _this = this;
	// 根据订单_id查询商品_id 和 购买数量
	userOrder.findErCiFanBi({_id:params._id},function(orderData){
		if(orderData.code == 1){
			var goodId = orderData.goodId;
			var buynum = orderData.num;
			// 通过商品id查询商品积分价格
			Markets.findErCiScore({goodId:goodId},function(marketData){	
				if(marketData.code == 1){
					var score = marketData.score;
					// 计算购买所花的总积分
					var allErCiScore = (score * buynum).toFixed(2);
					// 给兑换着增加余额  首先获取返佣比例
					datas.findErCi({},function(erCiData){
						if(erCiData.code == 1){
							var biLi = erCiData.num;
							// 计算要增加的余额
							var addGold = (allErCiScore * biLi / 100).toFixed(2);
							// 给用户增加余额
							_this.model('Users').findOne({uid:params.uid},['gold'],function(userErr,userDoc){
								if(userErr){
									callback({code:0,msg:'网络错误'});
									return;
								}else{
									// 增加金币成功  
									userDoc.gold = (parseFloat(userDoc.gold) + parseFloat(addGold)).toFixed(2);
									userDoc.save(function(goldErr,goldDoc){
										// 生成日志
										_Logs.addLog({uid:params.uid,type:2,msg:'二次兑换成功,增加余额'+addGold+''},function(logData){
											if(logData.code == 1){
												// 删除订单
												userOrder.deleteOneOrder({_id:params._id},function(deleteData){
													if(deleteData.code == 1){
														callback({code:1,msg:'兑换成功'});
														return;
													}else{
														callback({code:0,msg:'网络错误'});
														return;
													}
												})
											}else{
												callback({code:0,msg:'网络错误'});
												return;
											}
										})
									})
								}
							})
						}else{
							callback({code:0,msg:'网络错误'});
							return;
						}
					})
				}else{
					callback({code:0,msg:'商品不存在'});
					return;
				}
			})
		}else{
			callback({code:0,msg:'网络错误'});
			return;
		}
	})
}

// 购买某个用户的小贝壳
userSchema.statics.buyOneXiaoBeiKeOrder = function(params,callback){
	var _this = this;
	var uid = params.uid;
	var _id = params._id;
	// 查询此订单是否可购买
	xiaoBeiKeOrder.findIdIfBuy({_id:_id},function(canBuyData){
		if(canBuyData.code == 1){
			// 可以购买 查看积分是否够用
			xiaoBeiKeOrder.scoreIfCanBuy({_id:_id},function(scoreData){
				if(scoreData.code == 1){
					_this.model('Users').findOne({uid:uid},['score','xiaobeike'],function(scoreErr,scoreDoc){
						if(scoreErr){
							callback({code:0,msg:'网络错误'});
							return;
						}else{
							if(parseFloat(scoreDoc.score) >= scoreData.price){
								// 积分充足，进行购买  减少用户积分 增加用户小倍壳
								var newScore = (parseFloat(scoreDoc.score) - scoreData.price).toFixed(2);
								scoreDoc.score = newScore;
								if(scoreDoc.xiaobeike == null || scoreDoc.xiaobeike == undefined){
									scoreDoc.xiaobeike = scoreData.num;
								}else{
									scoreDoc.xiaobeike = (scoreDoc.xiaobeike+scoreData.num).toFixed(2);
									scoreDoc.save(function(uidErr,uidDoc){
										if(uidErr){
											callback({code:0,msg:'网络错误'});
											return;
										}else{
											// 给购买者增加日志
											_Logs.addLog({uid:uid,type:2,msg:'花费'+scoreData.price+'积分购买'+scoreData.num+'小倍壳'},function(uidLogData){
												if(uidLogData.code == 1){
													// 给订单所属者增加积分
													_this.model('Users').findOne({uid:scoreData.uid},['score'],function(putUidErr,putUidDoc){
														if(putUidErr){
															callback({code:0,msg:'网络错误'});
															return;
														}else{
															putUidDoc.score = (parseFloat(putUidDoc.score) + parseFloat(scoreData.price*90/100)).toFixed(2);
															putUidDoc.save(function(putUidSaveErr,putUidSaveDoc){
																if(putUidSaveErr){
																	callback({code:0,msg:'网络错误'});
																	return;
																}else{
																	// 给订单所属者增加日志
																	_Logs.addLog({uid:scoreData.uid,type:2,msg:'售出'+scoreData.num+'小倍壳增加'+scoreData.price*95/100+'积分。'},function(putUidLogData){
																		if(putUidLogData.code == 1){
																			// 更改订单状态
																			xiaoBeiKeOrder.updateOrderState({_id:_id},function(updateOrderData){
																				if(updateOrderData.code == 1){
																					callback({code:1,msg:'购买成功'});
																					return;
																				}else{
																					callback({code:0,msg:'网络错误'});
																					return;
																				}
																			})
																		}else{
																			callback({code:0,msg:'网络错误'});
																			return;
																		}
																	})
																}
															})
														}
													})
												}else{
													callback({code:0,msg:'网络错误'});
													return;
												}
											})
										}
									})
								}
							}else{
								callback({code:0,msg:'积分不足，请充值'});
								return;
							}
						}
					})
				}else{
					callback({code:0,msg:'网络错误'});
					return;
				}
			})

		}else if(canBuyData.code == 0){
			callback({code:0,msg:'网络错误'});
			return;
		}else if(canBuyData.code == 2){
			callback({code:0,msg:'不好意思，您来晚一步咯~'})
		}
	})
}

// 卖出小倍壳
userSchema.statics.putXiaoBeiKe = function(params,callback){
	var _this = this;
	var uid = params.uid;
	var num = params.num;
	var price = params.price;
	// 查找当前拥有小倍壳数量、比较是否足够卖出
	_this.model('Users').findOne({uid:uid},['xiaobeike','ddzgrade','todaysellbeike'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误'});
			return;
		}else if(doc == null || doc == undefined || doc.xiaobeike == null || doc.xiaobeike == undefined || num > doc.xiaobeike){
			callback({code:2,msg:'小倍壳数量不足'});
			return;
		}else{
			if(doc.todaysellbeike == null || doc.todaysellbeike == undefined){
				doc.todaysellbeike = 0;
			}
			var canBuyBeiKe = 0;
			// 判断用户当前等级 限制最大卖出数量
			if(doc.ddzgrade == 0){
				callback({code:0,msg:'当前等级不可售出小倍壳,请升级'});
				return;
			}else if(doc.ddzgrade == 1){
				canBuyBeiKe = parseInt(500 - doc.todaysellbeike);
				if(num > canBuyBeiKe){
					callback({code:0,msg:'当前等级当天最多可出售500贝壳'});
					return;
				}else{
					sellBeiKe();
					return;
				}
			}else if(doc.ddzgrade == 2){
				canBuyBeiKe = parseInt(2000 - doc.todaysellbeike);
				if(num > canBuyBeiKe){
					callback({code:0,msg:'当前等级当天最多可出售2000贝壳'});
					return;
				}else{
					sellBeiKe();
					return;
				}
			}else if(doc.ddzgrade == 3){
				canBuyBeiKe = parseInt(5000 - doc.todaysellbeike);
				if(num > canBuyBeiKe){
					callback({code:0,msg:'当前等级当天最多可出售5000贝壳'});
					return;
				}else{
					sellBeiKe();
					return;
				}
			}else if(doc.ddzgrade == 4){
				canBuyBeiKe = parseInt(10000 - doc.todaysellbeike);
				if(num > canBuyBeiKe){
					callback({code:0,msg:'当前等级当天最多可出售10000贝壳'});
					return;
				}else{
					sellBeiKe();
					return;
				}
			}else if(doc.ddzgrade == 5){
				canBuyBeiKe = parseInt(100000 - doc.todaysellbeike);
				if(num > canBuyBeiKe){
					callback({code:0,msg:'当前等级当天最多可出售100000贝壳'});
					return;
				}else{
					sellBeiKe();
					return;
				}
			}else if(doc.ddzgrade > 5){
				sellBeiKe();
				return;
			}
			function sellBeiKe(){
				var newNum = (doc.xiaobeike - num).toFixed(2);
				var newTodaySellBeike = (doc.todaysellbeike + num).toFixed(2);
				var nowTime = new Date().getTime();
				// 修改当前用户拥有小倍壳数量
				_this.model('Users').updateOne({uid:uid},{xiaobeike:newNum,todaysellbeike:newTodaySellBeike,sellbeiketime:nowTime},function(erra,doc){
					if(erra){
						callback({code:0,msg:'网络错误'});
						return;
					}else{
						// 生成订单
						var paramsPut = {
							uid:uid,
							buynum:num,
							time:new Date().getTime(),
							ifbuy:false,
							state:false,
							price:price
						}
						xiaoBeiKeOrder.createOneOrder(paramsPut,function(data){
							if(data.code == 1){
								// 生成日志
								_Logs.addLog({uid:uid,type:2,msg:'卖出'+num+'小倍壳成功,请耐心等待订单匹配。'},function(LogData){
									if(LogData.code == 1){
										callback({code:1,msg:'卖出成功'});
										return;
									}else{
										callback({code:0,msg:'网络错误。'});
										return;
									}
								})
							}else{	
								callback({code:0,msg:'网络错误'});
								return;
							}
						})
					}
				})
			}
		}
	})
}

// 购买小倍壳
userSchema.statics.buyXiaoBeiKe = function(params,callback){
	var _this = this;
	var uid = params.uid;
	// 购买数量
	var num = params.num;
	// 查询当前剩余小倍壳数量
	datas.findShuLiang(params,function(data){
		if(data.code == 1){
			var xiaoBeiKeNum = data.num;
			if(xiaoBeiKeNum > num){
				// 减去发行小倍壳数量
				var newNum = parseInt(xiaoBeiKeNum) - parseInt(num);
				datas.updateXiaoBeiKeNum({num:newNum},function(updataData){
					if(updataData.code == 1){
						// 根据当前价格查询所需积分
						datas.findBeiKeJia(params,function(kaiPanData){
							if(kaiPanData.code == 1){
								// 当前小倍壳价格
								var nowPrice = kaiPanData.kaiPanJia;
								// 购买所需积分
								var allScore =  (parseFloat(nowPrice)*parseFloat(num)/100).toFixed(2);
								// 查询用户当前积分
								_this.model('Users').findOne({uid:uid},['score','xiaobeike'],function(err,doc){
									if(err){
										callback({code:1,msg:'网络错误。'});
										return;
									}else{
										// 判断积分是否充值
										if(doc.score >= allScore){
											// 减少用户积分
											doc.score = (doc.score - allScore).toFixed(2);
											// 增加小贝壳数量
											if(doc.xiaobeike == null||doc.xiaobeike == undefined){
												doc.xiaobeike = 0 + num;
											}else{
												doc.xiaobeike = doc.xiaobeike + num;
												doc.save(function(erra,doca){
													if(erra){
														callback({code:0,msg:'网络错误'});
														return;
													}else{
														// 积分、小倍壳数量修改成功  增加订单
														var paramsJson = {
															uid:uid,
															time:new Date().getTime(),
															ifbuy:true,
															state:true,
															price:nowPrice,
															buynum:num
														}
														xiaoBeiKeOrder.createOneOrder(paramsJson,function(xiaoBeiKeOrderData){
															// 判断订单是否生成成功
															if(xiaoBeiKeOrderData.code == 1){
																// 生成日志
																_Logs.addLog({uid:uid,type:2,msg:'充值'+num+'小倍壳成功,扣除'+allScore+'积分'},function(logData){
																	if(logData.code == 1){
																		callback({code:1,msg:'购买成功'});
																	}else{
																		callback({code:0,msg:'网络错误,生成日志失败'});
																		return;
																	}
																})
															}else{
																callback({code:0,msg:'网络错误。'});
																return;
															}
														})
													}
												})
											}
										}else{
											callback({code:2,msg:'积分不足，请充值'});
											return;
										}
									}
								})
							}else{
								callback({code:0,msg:'网络错误'});
								return;
							}
						})
					}else{
						callback({code:0,msg:'网络错误。'});
						return;
					}
				})
			}else{
				callback({code:3,msg:'小倍壳总发行量不足。'});
				return;
			}
		}else{
			callback({code:0,msg:'网络错误。'});
			return;
		}
	})
}

// 查询用户拥有多少小倍壳
userSchema.statics.findUserHaveBeiKe = function(params,callback){
	this.model('Users').findOne({uid:params.uid},['xiaobeike'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络原因查询失败'});
			return;
		}else if(doc.xiaobeike == null || doc == null || doc == undefined || doc.xiaobeike == undefined || doc.xiaobeike == 0){
			callback({code:1,num:0});
			return;
		}else{
			callback({code:1,num:doc.xiaobeike});
			return;
		}
	})
}

// 升級用户等级
userSchema.statics.upDdzGarde = function(params,callback){
	var uid = params.uid;
	var garde = params.garde;
	this.model("Users").updateOne({uid:uid},{ddzgrade:garde},function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误'});
			return;
		}else{
			callback({code:1,msg:'升级成功'});
		}
	})
}

// 查询用户当前斗地主等级
userSchema.statics.nowDdzGrade = function(parmars,callback){
	this.model('Users').findOne({uid:parmars.uid},['ddzgrade'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误，查询当前斗地主等级失败'});
			return;
		}else{
			ddzGrade.duiYingDengJi({grade:doc.ddzgrade},function(data){
				callback({data});
			})
		}
	})
}

// 查询用户当前所推广人数
userSchema.statics.findAllTuiGuang = function(parmars,callback){
	this.model('Users').find({fuid:parmars.uid},function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误，查询推广人数失败'});
			return;
		}else{
			callback({code:1,num:doc.length});
			return;
		}
	})
}

// 修改用户战略合作协议书状态
userSchema.statics.changeZlhzShu = function(req,callback){
	this.model('Users').updateOne({uid:req.uid},{zlhzstu:true},function(err,doc){
		err?callback({code:0,msg:'修改失败'}):callback({code:1,msg:'修改成功'})
	})
}

// 查询是否同意战略合作协议书
userSchema.statics.zlhzShu = function(req,callback){
	this.model('Users').findOne({uid:req.uid},['zlhzstu'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误'});
			return;
		}else{
			if(doc.zlhzstu != true){
				callback({code:1,msg:'不能看'})
			}else{
				callback({code:2,msg:'能看'})
			}
		}
	})
}

// 是否可观看此视频
userSchema.statics.showThisVideo = function(parmars,callback){
	var uid = parmars.uid;
	var videoId = parmars.video_id;
	// 查询所有可观看视频的id
	this.model("Users").findOne({uid:uid},['canshowvideo'],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误'});
			return;
		}else{
			if(doc.canshowvideo.indexOf(videoId) == -1){
				Video.findThisNumIfZero({videoId:videoId},function(data){
					callback(data);
				})
			}else{
				callback({code:1,msg:'成功'});
			}
		}
	})
}

// 是否可观看視頻
userSchema.statics.canShowVideo = function(parmars,callback){
	var uid = parmars.uid;
	this.model("Users").findOne({uid:uid},[
		'username','ifcanshowvideo'
		],function(err,doc){
		if(err){
			callback({code:0,msg:'网络错误。'})
		}else{
			if(doc.ifcanshowvideo == 'true'){
				callback({code:1,msg:'可以观看视频。'});
			}else{
				callback({code:0,msg:'不可观看。'});
			}
		}
	})
},

//用户注册方法
userSchema.statics.register = function(data,callback){
	var _this = this;
	var vdata

	if(Config.canSameNickName){
		toNew();
	}else{
		this.model('Users').findOne({nickname:data.nickname},function(err,doc){
			if(!doc){
				//没有重名
				_this.model('Users').findOne({username:data.username},function(err,doc){
					if(doc){
						callback({code:0,msg:'该号码已注册,请直接登录'})
					}else{
						//验证短信验证码
						_Phonecode.checkCode({phone:data.username,code:data.code},function(res){
							if(res.code==1){
								toNew()
							}else{
								callback(res)
							}
						})
						
					}
				})
			}else{
				callback({code:0,msg:'昵称已被使用'})
			}
		})
	}

	//日志表
	function newLogBase(){
		return new Promise(function(resolve, reject){
			_Logs.newLog({uid:vdata.uid,_uid:vdata._id},function(res){
				if(res.code == 1){
					resolve('日志表创建完成')
				}else{
					reject('日志表创建失败')
				}
			})
		})
	}

	//仓库表
	function newWearhouse(){
		return new Promise(function(resolve, reject){
			_Wearhouse.newWh({uid:vdata.uid,_uid:vdata._id},function(res){
				if(res.code == 1){
					resolve('仓库表创建完成')
				}else{
					reject('仓库表创建失败')
				}
			})
		})
	}
	//身份表
	function newCard(){
		return new Promise(function(resolve,reject){
			_Card.newCard({uid:vdata.uid,_uid:vdata._id},function(res){
				if(res.code == 1){
					resolve('身份表创建完成')
				}else{
					reject('身份表创建失败')
				}
			})
		})
	}
	//上下级关系表
	function newDistribution(){
		return new Promise(function(resolve,reject){
			_Distribution.addDistribution({uid:vdata.uid,fuid:data.fuid},function(res){
				if(res.code == 1){
					resolve('上下级关系表创建完成')
				}else{
					reject('上下级关系表创建失败')
				}
			})
		})
	}
	//提现表


	function toNew(){
		//计算最新ID
		_this.model('Users').count(function(err,num){
			if(num != 0){
				num += Config.startUid
			}
			data.uid = num;
			var psd = data.password
			var md5 = crypto.createHash('md5');
			var md5psd = md5.update('single'+psd+psd+'dog').digest('hex');
			data.password = md5psd
			data.regTime = Date.now()
			_this.model('Users').create(data,function(err,doc){
				if(doc){
					vdata = doc
					//继续创建一系列表...
					Promise.resolve(doc)
						.then(newLogBase)
						.then(newWearhouse)
						.then(newCard)
						.then(newDistribution)
						.then(function(){
							callback({code:1,msg:'注册成功'})
							_Logs.addLog({uid:doc.uid,type:2,msg:'注册成功,获取减度视力体验一次'},function(data){
							})
						}).catch(function(v){
							callback({code:0,msg:'注册失败'})
						})
				}else{
					callback({code:0,msg:'注册失败'})
				}
			})
		})
	}
}

//用户登录方法 {username:13800000000,password:'xxxxx'}
userSchema.statics.login = function(data,callback){
	var md5psd = Config.toMd5('single'+data.password+data.password+'dog');
	this.model('Users').findOne({username:data.username,password:md5psd},[
		'username','usession','allcash','score','uid','nickname','gold','loginTimes','diamond','score','lv','avatar','frozen','lastLoginTime'
		],function(err,doc){

			var cookie = Config.toMd5('user'+md5psd+'session')

			var session = Config.toMd5('cap'+cookie+'cap')

		if(!err&&doc){
			doc.gold = doc.gold.toFixed(2)
			if(Date.now()>doc.frozen){
				doc.loginTimes++;
				doc.lastLoginTime = Date.now();
				doc.usession = session
				doc.save(function(err,doc){
					callback({
						code:1,
						msg:'登录成功',
						data:doc,
						cookie:cookie
					});
				})
			}else{
				callback({code:0,msg:'账号冻结'})
			}
		}else{
			callback({code:0,msg:'请检查账号密码'})
		}
	})
}

//用户修改密码方法 {username:13800000000,password:'xxxx',code:234567}
userSchema.statics.changePwd = function(data,callback){
	var psd = data.password
	var md5 = crypto.createHash('md5');
	var md5psd = md5.update('single'+psd+psd+'dog').digest('hex');
	var _this = this;
	_Phonecode.checkCode({phone:data.username,code:data.code},function(res){
		if(res.code == 1){
			_this.model('Users').updateOne({username:data.username},{password:md5psd},function(err,doc){
				err||callback({code:1,msg:'密码修改成功'})
			})
		}else{
			callback(res)
		}
	})
	
}

//用户增加金币的方法 {uid:0,type:'gold',num:100,increase:true}
userSchema.statics.changeRich = function(req,callback){
	console.log("into this function");
	if(req.increase){
		this.model('Users').findOne({uid:req.uid},["gold","diamond","score","xiaobeike"],function(err,doc){
			if(doc[req.type] == null || doc[req.type] == undefined){
				doc[req.type] = parseFloat(req.num);
			}else{
				doc[req.type] = parseFloat(doc[req.type]) + parseFloat(req.num);
			}
			doc.save(function(){
				callback({code:1})
			})
		})
	}else{
		this.model('Users').findOne({uid:req.uid},["gold","diamond","score","xiaobeike"],function(err,doc){
			doc[req.type]-=req.num
			doc.save(function(){
				callback({code:1})
			})
		})
	}
}


//重新获取自己的数据
userSchema.statics.newMyData = function(req,callback){
	this.model('Users').findOne({username:req.username},[
		'username','usession','allcash','uid','nickname','gold','loginTimes','diamond','score','lv','avatar','frozen','lastLoginTime','xiaobeike','ylhfanyong'
		],function(err,doc){
			if(doc){
				doc.gold = doc.gold.toFixed(2)
				if(doc.xiaobeike == undefined || doc.xiaobeike == null){
					doc.xiaobeike = 0;
				}
				if(doc.ylhfanyong == undefined || doc.ylhfanyong == null){
					doc.ylhfanyong = 0;
				}
				_Distribution.getUserVip({uid:doc.uid},function(res){
					callback({code:1,data:doc,svip:res.lv})
				})
			}else{
				callback({code:0})
			}
		})
}

userSchema.statics.changeAllout = function(req,callback){
	this.model('Users').update({uid:req.uid},{$inc:{allcash:req.num}},function(err,doc){
		if(err){
			callback({code:0,msg:'处理失败'})
		}else{
			callback({code:1,msg:'处理成功'})
		}
	})
}


// admin获取用户总数
userSchema.statics.getUsers = function(callback){
	// {code:1,count:xxxx,realcount:xxxx}
	var _this = this
	var result = new Object()
	this.model('Users').count(function(err,num){
		result.count = num
		_this.model('Users').find({allpay:{$gt:0}}).count(function(err,num){
			result.realcount = num
			console.log('查询用户总条数',JSON.stringify(result))
			callback({code:1,data:result})
		})
	})
}

//分页查找用户
userSchema.statics.pageUsers = function(page,callback){
	var pageValue = 10
	this.model('Users').find({}).sort('uid').skip((page-1)*pageValue).limit(pageValue).exec(function(err,doc){
		callback(doc)
	})
}


//封号与解封 1封号 0解封
userSchema.statics.freezeUser = function(req,callback){
	this.model('Users').update({uid:req.uid},{frozen:Date.now()*req.type*10,usession:'00000'},function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}	


//用户身份校验
userSchema.statics.check = function(req,callback){
	req=JSON.parse(req)
	if(req.hasOwnProperty('userCookie')&&req.hasOwnProperty('userName')){
		var session = Config.toMd5('cap'+req.userCookie+'cap')
		this.model('Users').findOne({username:req.userName,usession:session},['username','usession'],function(err,doc){
			if(!err&&doc){
				callback({code:1,msg:'身份校验有效'})
			}else{
				callback({code:-1,msg:'登录信息过期'})
			}
		})
	}else{
		callback({code:-1,msg:'登录信息过期'})
	}
}

userSchema.statics.initToday = function(){
	this.model('Users').updateMany({},{todayJob:0},function(err,doc){
	})
}







module.exports = Config.db.model('Users',userSchema);