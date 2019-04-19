var express = require('express');
var router = express.Router();

var qrCode = require('qrcode')

var formidable = require('formidable')

var path = require('path')
var fs = require('fs')

var Userjob = require('../modules/businessLogic/userJobList.js')

var appSocket = require('../modules/businessLogic/appSocket.js')

var appRules = ['login','reg','getCode','getNews','changePwd']
/* GET home page. */
//  {type:xxx,data:{xxx,xxx},cookie:{cookie:xxx}}
// cookie {userName,usession}
router.post('/', function(req, res, next) {
	console.log(req.body)
	console.log('收到用户请求',req.body.type)
	// console.log(JSON.parse(req.body.data))

	if(appRules.indexOf(req.body.type)!=-1){
		if(typeof req.body.data == 'string'){
			appSocket[req.body.type](JSON.parse(req.body.data),function(doc){
				res.send(doc)
			})
			return
		}
		appSocket[req.body.type](req.body.data,function(doc){
			res.send(doc)
		})
	}else{
		var cookie = req.body.cookie
		appSocket.check(cookie,function(doc){
			if(doc.code == 1){
				appSocket[req.body.type](JSON.parse(req.body.data),function(doc){
					res.send(doc)
				})
			}else{
				res.send({code:-1,msg:'身份信息过期'})
			}
		})

		// new Promise(function(resolve,reject){
			
		// }).then(function(){
			
		// }).catch(function(){
			
		// })
	}
});

router.post('/upload',function(req,res,next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/screens");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        var filename = 'screen.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = req.query.uid+'_' +req.query.jobId +"_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var imgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + imgName;
        fs.renameSync(files.file.path, newPath);  //重命名
        //
        Userjob.updateImgHref({
        	uid:req.query.uid,
        	_id:req.query._id,
        	src:'images/screens/'+imgName
        },function(data){
        	 res.send(data)
        })
       
    })
})

router.post('/uploadForNew',function(req,res,next){
	console.log(req.query)
	var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/userjob");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        // console.log(err)
        // console.log(fields)
        // console.log(files)
        // var filename = files.the_file.name
        var filename = 'screen.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = req.query.uid+"_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var imgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + imgName;
        console.log('======',files)
        console.log('========================')
        console.log(files.file.path)
        // console.log(files.newImg.path)
        fs.renameSync(files.file.path, newPath);  //重命名
        //
        req.query.value = 'images/userjob/'+imgName
        var softDate = {
        	uid:req.query.uid,
        	data:req.query
        }
        appSocket.update(softDate,function(data){
        	res.send(data)
        })
       
    })
})

//uid
router.get('/ewm',function(req,res,next){
	qrCode.toDataURL('http://taolejin.cn/app/register.html?code='+req.query.uid+'&time='+Date.now(),function(err,url){
		res.send(url)
	})
})

module.exports = router;
