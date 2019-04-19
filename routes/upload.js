var express = require('express');
var router = express.Router();

var formidable = require('formidable')

var path = require('path')
var fs = require('fs')

router.post('/',function(req,res,next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/upload");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        // var filename = files.the_file.name
        var filename = 'newImg.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var imgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + imgName;
        fs.renameSync(files.newImg.path, newPath);  //重命名
        res.send({data:"images/upload/"+imgName})
    })
})

// 用户营业执照上传
router.post('/examine',function(req,res,next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/examine");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        console.log('into')
        var filename = 'zzqpp.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var imgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + imgName;
        fs.renameSync(files.file.path, newPath);  //重命名
        res.send({code:1,data:"http://www.taolejin.cn/images/examine/"+imgName})
    })
})

// 用户身份证上传
router.post('/idcard',function(req,res,next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/idcard");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        console.log('into')
        var filename = 'zzqpp.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var imgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + imgName;
        fs.renameSync(files.file.path, newPath);  //重命名
        res.send({code:1,data:"http://www.taolejin.cn/images/idcard/"+imgName})
    })
})

// 资源圈图片上传
router.post('/zzqpp',function(req,res,next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/zzqpp");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        var filename = 'goods.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var imgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + imgName;
        fs.renameSync(files.file.path, newPath);  //重命名
        res.send({code:1,data:"http://www.taolejin.cn/images/zzqpp/"+imgName})
    })
})

// 商城图片上传
router.post('/market',function(req,res,next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/market");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        var filename = 'goods.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var imgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + imgName;
        fs.renameSync(files.file.path, newPath);  //重命名
        res.send({data:"images/market/"+imgName})
    })
})

// 上传视频
router.post('/video',function(req,res,next){
    console.log("video=======",req)
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/videos/video");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        // var filename = files.the_file.name
        var filename = 'video.mp4'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var vidName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + vidName;
        console.log(newPath)
        fs.renameSync(files.file.path, newPath);
        res.send({code:1,msg:'上传成功',data:"http://taolejin.cn/videos/video/" + vidName})
    })
})

// 上传视频
router.post('/zlhz',function(req,res,next){
    console.log("xm=======",req)
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/images/zlhz");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        // var filename = files.the_file.name
        var filename = 'xm.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1    ; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var xmName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + xmName;
        fs.renameSync(files.file.path, newPath);
        res.send({code:1,msg:'上传成功',data:"http://taolejin.cn/images/zlhz/" + xmName})
    })
})

router.post('/video_img',function(req,res){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/videos/video_img");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        // var filename = files.the_file.name
        var filename = 'video_img.png'
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes()+ "_" + date.getSeconds();
        var vidImgName = name + time + '.' + type;
        var newPath = form.uploadDir + "/" + vidImgName;
        console.log(newPath)
        fs.renameSync(files.file.path, newPath);
        res.send({code:1,msg:'上传成功',data:"http://taolejin.cn/videos/video_img/" + vidImgName})
    })
})


module.exports = router;