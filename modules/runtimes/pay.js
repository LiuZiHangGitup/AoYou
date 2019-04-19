//这里处理一些pay的逻辑
var Config = require('./../config.js')

var Log = require('./../runtimes/logs.js');
var Users = require('./../runtimes/users.js');
var Relation = require('./../runtimes/relation.js');
var zlhzOrder = require('./../businessLogic/zlhzOrder.js');
var zlhz = require('./../businessLogic/zlhz.js');
var video = require('./../businessLogic/video.js');
var datas = require('../businessLogic/datas.js');
var ylhOrder = require('../businessLogic/ylhOrder.js');
var ylhFanXian = require('../businessLogic/ylhFanXian.js');
var userMusic = require('../businessLogic/userMusic.js');


var paySchema = new Config.mongoose.Schema({
	//用户ID
	uid:{type:Number,default:0},
	//充值渠道 Ali Wx
	type:{type:String,default:''},
	//充值时间
	time:{type:Number,default:0},
	//充值金额
	num:{type:Number,default:0},
	//充值处理状态
	stu:{type:Boolean,default:false},
	//充值订单号
	order:{type:String,default:''},
})

paySchema.statics.indexPay = function(){
	var _this = this
	this.model('Paylists').findOne({time:8888},function(err,doc){
		if(!doc){
			_this.model('Paylists').create({
				time:8888
			},function(){
			})
		}else{
		}
	})
}
paySchema.statics.createOne = function(params,callback){
	this.model('Paylists').create({
		uid:1002,
		type:"ALI",
		time:Date.now(),
		num:params.bill_fee/100,
		stu:true,
		order:"AlipayA1002A1542172978396"
	},function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'创建成功'})
	})
}
paySchema.statics.newPay = function (req,callback) {	
	var _this = this;
	if(req.optional.formAddress == 'music'){
		_this.model('Paylists').findOne({order:req.transaction_id},function(err,doc){
			if(!doc){
				_this.model('Paylists').create({
					uid:req.optional.userId,
					type:req.channelType,
					time:Date.now(),
					num:req.bill_fee/100,
					stu:true,
					order:req.transactionId
				},function(erra,doca){
					if(erra){
						return;
					}else{
						_this.model('Users').findOne({uid:parseInt(req.optional.userId)},['allpay'],function(errb,docb){
							if(errb){
								return;
							}else{
								docb.allpay += req.bill_fee/100;
								docb.save(function(errc,docc){
									if(errc){
										return;
									}else{
										var musicParams = {};
										new Promise((reslove,rejest) => {
											if(req.optional.num == 3){
												musicParams = {
													uid:req.optional.userId,
													buytime:new Date().getTime(),
													idcardimg:req.optional.idCardImg,
													havemusic:['http://www.taolejin.cn/images/music/musicThree.png']
												}
												reslove();
											}else if(req.optional.num == 2){
												musicParams = {
													uid:req.optional.userId,
													buytime:new Date().getTime(),
													idcardimg:req.optional.idCardImg,
													havemusic:['http://www.taolejin.cn/images/music/musicOne.png','http://www.taolejin.cn/images/music/musicOne.png']
												}
												reslove();
											}else if(req.optional.num == 1){
												musicParams = {
													uid:req.optional.userId,
													buytime:new Date().getTime(),
													idcardimg:req.optional.idCardImg,
													havemusic:['http://www.taolejin.cn/images/music/musicOne.png']
												}
												reslove();
											}
										}).then(()=>{
											userMusic.newUserMusic(musicParams,function(musicData){
												if(musicData.code == 1){
													// 生成日志
													Log.addLog({uid:req.optional.userId,type:2,msg:'花费'+req.bill_fee/100+'元购买'+req.optional.num+'张门票'},function(logData){
														if(logData.code == 1){
															callback('ok');
															return;
														}else{
															callback('ok');
															return;
														}
													})
												}else{
													return;
												}
											})
										})
									}
								})
							}
						})
					}
				})
			}else{
				callback('isOk');
				return;
			}
		})

	}else if(req.optional.formAddress == 'ddzGarde'){
		_this.model('Paylists').findOne({order:req.transaction_id},function(err,doc){
			if(!doc){
				_this.model('Paylists').create({
					uid:req.optional.userId,
					type:req.channelType,
					time:Date.now(),
					num:req.bill_fee/100,
					stu:true,
					order:req.transactionId
				},function(erra,doca){
					if(erra){
						return;
					}else{
						// 加总充值 加总积分
						_this.model('Users').findOne({uid:parseInt(req.optional.userId)},['allpay','fuid','ddzgrade'],function(errb,docb){
							if(errb){
								return;
							}else{
								docb.allpay += req.bill_fee/100;
								var fuid = docb.fuid;
								var oldddzgrade = docb.ddzgrade;
								docb.save(function(errc,docc){
									if(errc){
										return;
									}else{
										Users.upDdzGarde({uid:parseInt(req.optional.userId),garde:parseInt(req.optional.garde)},function(upDdzData){
											if(upDdzData.code == 1){
												// 生成日志
												Log.addLog({uid:parseInt(req.optional.userId),type:2,msg:'【斗地主】充值'+req.bill_fee/100+'元升级为'+req.optional.gardename+''},function(logData){
													if(logData.code == 1){
														callback('ok');
														// 进行返佣
														_this.model('Users').findOne({uid:fuid},function(errd,docd){
															if(errd){
																return;
															}else{
																if(docd.ddzgrade<oldddzgrade){
																	return;
																}else{
																	var addGold = parseFloat(req.bill_fee/100*70/100).toFixed(2);
																	docd.gold = (parseFloat(docd.gold) + parseFloat(addGold)).toFixed(2);
																	docd.save(function(erre,doce){
																		if(erre){
																			return;
																		}else{
																			Log.addLog({uid:parseInt(req.optional.userId),type:2,msg:'【斗地主】获得用户'+parseInt(req.optional.userId)+',升级'+req.optional.gardename+'返佣'+addGold+'元'})
																		}
																	})
																}
															}
														})
													}
												})
											}
										})
									}
								})
							}
						})
					}
				})
			}else{
				callback('isOk');
				return;
			}
		})
	}else if(req.optional.formAddress == 'jfcz'){
		_this.model('Paylists').findOne({order:req.transaction_id},function(err,doc){
			if(!doc){
				_this.model('Paylists').create({
					uid:req.optional.userId,
					type:req.channelType,
					time:Date.now(),
					num:req.bill_fee/100,
					stu:true,
					order:req.transactionId
				},function(erra,doca){
					if(erra){
						return;
					}else{
						// 加总充值 加总积分
						_this.model('Users').findOne({uid:parseInt(req.optional.userId)},['allpay','score'],function(errb,docb){
							if(errb){
								return;
							}else{
								docb.allpay += req.bill_fee/100;
								docb.score += req.bill_fee/100;
								docb.save(function(errc,docc){
									if(errc){
										return;
									}else{
										// 生成日志
										Log.addLog({uid:parseInt(req.optional.userId),type:2,msg:'花费'+req.bill_fee/100+'元充值积分'+req.bill_fee/100+'个'},function(data){
											if(data.code == 1){
												callback('ok');
											}
										})
									}
								})
							}
						})
					}
				})
			}else{
				callback('isOk');
			}
		})

	}else if(req.optional.formAddress == 'ylh'){
		// 修改支付订单参数
		_this.model('Paylists').findOne({order:req.transaction_id},function(erra,doca){
			if(!doca){
				_this.model('Paylists').create({
					uid:req.optional.userId,
					type:req.channelType,
					time:Date.now(),
					num:req.bill_fee/100,
					stu:true,
					order:req.transactionId
				},function(errb,docb){
					if(errb){
						return;
					}else{
						// 加总充值
						_this.model('Users').findOne({uid:req.optional.userId},['allpay'],function(errc,docc){
							if(errc){
								return;
							}else{
								docc.allpay = (docc.allpay + (req.bill_fee/100)).toFixed(2); 
								docc.save(function(errd,docd){
									if(errd){
										return;
									}else{
										var indexCount = 0,goodList = req.optional.goodList,allPrice = 0;
										createYlhOrder();
										function createYlhOrder(){
											if(indexCount == goodList.length){
												// 创建返现订单
												// 1.首先查询返现比例
												datas.findYlhFanXian({},function(datasFanXianData){
													if(datasFanXianData.code == 1){
														var fanXianNum = parseFloat(datasFanXianData.num);
														var beiChuShu = allPrice*fanXianNum/1000;
														var fanXianTianShu = parseFloat(allPrice/beiChuShu).toFixed(0);
														var fanXianData = {
															uid:req.optional.userId,
															allday:fanXianTianShu,
															lasttime:new Date().getTime(),
															haveday:0,
															allprice:allPrice
														}
														ylhFanXian.newFanXian(fanXianData,function(newFanXianData){
															if(newFanXianData.code == 1){
																Log.addLog({uid:req.optional.userId,type:2,msg:'【易廉惠】购买商品成功,等待返现'},function(logData){
																	if(logData.code == 1){
																		callback('ok');
																		// 进行两级返佣
																		Relation.ordinary({uid:req.optional.userId,num:req.bill_fee/100,formAddress:req.optional.formAddress},function(){
																			Relation.senior({uid:req.optional.userId,num:req.bill_fee/100,formAddress:req.optional.formAddress},function(){
																			})
																		})
																	}else{
																		return;
																	}
																})
															}else{
																return;
															}
														})
													}else{
														return;
													}
												})
											}else{
												// 根据_id查询商品信息
												zlhz.findOneZlhz({_id:goodList[indexCount]._id},function(zlhzGoodData){
													if(zlhzGoodData.code == 1){
														var buyNum = parseFloat(goodList[indexCount].num);
														allPrice = (allPrice + (zlhzGoodData.data.price*buyNum)).toFixed(2);
														// 生成订单所需信息
														var ylhOrderInformation = {
															uid:req.optional.userId,
															goodid:goodList[indexCount]._id,
															num:buyNum,
															src:zlhzGoodData.data.src,
															address:req.optional.addressMsg.userAddress,
															goodname:zlhzGoodData.data.name,
															buytime:new Date().getTime(),
															phone:req.optional.addressMsg.userPhone,
															msg:req.optional.addressMsg.userMsg,
															other:'',
															state:1,
															username:req.optional.addressMsg.userName
														}
														ylhOrder.newOrder(ylhOrderInformation,function(ylhNewOrderData){
															if(ylhNewOrderData.code == 1){
																indexCount++;
																createYlhOrder();
																callback('ok');
															}else{
																return;
															}
														})
													}else{
														return;
													}
												})
											}
										}
									}
								})
							}
						})
					}
				})
			}else{
				callback('isOk');
			}
		})
	}else if(req.optional.formAddress == 'zlhz'){
		_this.model('Paylists').findOne({order:req.transaction_id},function(err,doc){
			if(!doc){
				_this.model('Paylists').create({
					uid:req.optional.userId,
					type:req.channelType,
					time:Date.now(),
					num:req.bill_fee/100,
					stu:true,
					order:req.transactionId
				},function(erra,doca){
					if(erra){
						return;
					}else{
						//加总充值
						_this.model('Users').findOne({uid:parseInt(req.optional.userId)},['allpay'],function(errb,docb){
							if(errb){
								return;
							}else{
								docb.allpay = (docb.allpay + (req.bill_fee/100)).toFixed(2); 
								docb.save(function(errc,docc){
									if(errc){
										return;
									}else{
										// 生成订单
										var orderTime = new Date().getTime();
										// 订单参数
										var orderData = {
											uid:req.optional.userId,
											xmuid:parseFloat(req.optional.xm.uid),
											orderimg:req.optional.xm.src,
											buytime: parseFloat(orderTime),
											xmname:req.optional.xm.name,
											username:req.optional.addressMsg.userName,
											userphone:req.optional.addressMsg.userPhone,
											address:req.optional.addressMsg.userAddress,
											msg:req.optional.addressMsg.userMsg,
											stu:0
										};
										zlhzOrder.newOrder(orderData,function(data){
											// 生成订单成功
											if(data.code == 1){
												// 项目归属者增加金币
												_this.model('Users').findOne({uid:parseInt(req.optional.xm.uid)},['gold'],function(errd,docd){
													var business = parseInt(req.optional.xm.business);
													var oncecom = parseInt(req.optional.xm.oncecom);
													var secondcom = parseInt(req.optional.xm.secondcom);
													docd.gold += req.bill_fee*business/100/100;
													docd.save(function(erre,doce){
														if(erre){
															return;
														}else{
															// 项目归属者生成日志
															Log.addLog({uid:parseInt(req.optional.xm.uid),type:2,msg:'用户'+req.optional.userId+'成为项目店长，拨款'+(req.bill_fee*business/100/100).toFixed(2)+'元。'},function(data){
																if(data.code == 1){
																	callback('ok');
																	_this.model('Paylists').updateOne({time:8888},{$inc:{num:req.bill_fee/100}},function(err,doc){
																	});
																	// 给购买者生成日志
																	Log.addLog({uid:parseInt(req.optional.userId),type:2,msg:'您已支付'+req.bill_fee/100+'元成为'+req.optional.xm.name+'项目店长'},function(dataa){
																		if(dataa.code == 1){
																			// 增加此项目购买次数
																		zlhz.addXmCount({id:req.optional.xm._id},function(data){
																			if(data.code == 1){
																				// 进行两级返佣
																				Relation.ordinary({uid:req.optional.userId,num:req.bill_fee/100,formAddress:req.optional.formAddress,oncecom:oncecom,secondcom:secondcom,mechanismCom:req.optional.xm.mechanismcom},function(){
																					Relation.senior({uid:req.optional.userId,num:req.bill_fee/100,formAddress:req.optional.formAddress,oncecom:oncecom,secondcom:secondcom,mechanismCom:req.optional.xm.mechanismcom},function(){
																					})
																				})
																			}else{
																				return;
																			}
																		})
																		}
																	});
																}
															})
														}
													})
												})
											}else{
												return;
											}
										})
									}
								})
							}
						});
					}
				})
			}else{
				callback('isOk');
			}
		})
	}else if(req.optional.formAddress == 'video'){
		//先搜索订单
		this.model('Paylists').findOne({order:req.transaction_id},function(err,doc){
			if(!doc){
				_this.model('Paylists').create({
					uid:req.optional.userId,
					type:req.channelType,
					time:Date.now(),
					num:req.bill_fee/100,
					stu:true,
					order:req.transactionId
				},function(err,doc){
					if(err){
						return;
					}else{
						//加金币 加日志 加总充值
						_this.model('Users').findOne({uid:parseInt(req.optional.userId)},['allpay'],function(errs,docs){
							if(errs){
								return;
							}else{
								docs.allpay += req.bill_fee/100;
								docs.save(function(erra,doca){
									if(erra){
										return;
									}else{
										_this.model('Users').findOne({uid:req.optional.userId},function(errss,docss){
											if(errss){
												callback({code:0,msg:'网络错误'})
											}else{
												docss.canshowvideo.push(req.optional.videoId);
												docss.save(function(errb,docb){
													if(errb){
														callback({code:0,msg:'修改失败。'});
													}else{
														Log.addLog({uid:parseInt(req.optional.userId),type:2,msg:'【充值成功】可观看视频'},function(data){
															if(data.code == 1){
																callback('ok')
																_this.model('Paylists').updateOne({time:8888},{$inc:{num:req.bill_fee/100}},function(err,doc){
																})
																video.addCount({videoId:req.optional.videoId},function(data){

																})
																//进入返佣
																Relation.ordinary({uid:req.optional.userId,num:req.bill_fee/100},function(){
																	Relation.senior({uid:req.optional.userId,num:req.bill_fee/100},function(){
																	})
																})
															}
														})
													}
												})
											}
										})
									}
								})
							}
						})
					}
				})
			}else{
				callback('isOk')
			}
		})
	}else if(req.bill_fee/100 == 5){
		if(req.bill_fee/100 == 5){
			_this.model('Users').updateOne({uid:req.optional.userId},{ifcanshowvideo:'true'},function(err,doc){
				if(err){
					callback({code:0,msg:'5元充值失败,依旧不可观看视频。'})
				}
			})	
		}
		//先搜索订单
		this.model('Paylists').findOne({order:req.transaction_id},function(err,doc){
			if(!doc){
				_this.model('Paylists').create({
					uid:req.optional.userId,
					type:req.channelType,
					time:Date.now(),
					num:req.bill_fee/100,
					stu:true,
					order:req.transactionId
				},function(err,doc){
					if(err){
						return;
					}else{
						//加金币 加日志 加总充值
						_this.model('Users').findOne({uid:parseInt(req.optional.userId)},['gold','allpay'],function(err,doc){
							if(err){
							}else{
								doc.gold += req.bill_fee/100
								doc.allpay += req.bill_fee/100
								doc.save(function(){
									Log.addLog({uid:parseInt(req.optional.userId),type:2,msg:'【充值成功】资产+'+req.bill_fee/100+'元'},function(data){
										if(data.code == 1){
											callback('ok')
											_this.model('Paylists').updateOne({time:8888},{$inc:{num:req.bill_fee/100}},function(err,doc){
											})
											//进入返佣
											Relation.ordinary({uid:req.optional.userId,num:req.bill_fee/100},function(){
												Relation.senior({uid:req.optional.userId,num:req.bill_fee/100},function(){
												})
											})
										}
									})
								})
							}
						})
					}
				})
			}else{
				callback('isOk')
			}
		})
	}else{
		window.location.href = 'http://www.taolejin.cn/admine/#/login';
	}
}
module.exports = Config.db.model('Paylists',paySchema);