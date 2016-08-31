var express = require("express");
var Cerveza = require("./models/cerveza").Cerveza;
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads/'});
var fs = require('fs');

router.get("/",function(req,res){
	/* busca el usuario */
	console.log('hola')
	res.render("index")
});

/* RUTAS REST */
/* CRUD */

router.get("/imagenes/new", function(req,res){
     res.render("app/imagenes/new");
});

router.get("/imagenes/:id/edit",function(req,res){
Cerveza.findById(req.params.id,function(err,imagen){
		res.render("app/imagenes/edit",{imagen : imagen})
	});
});


router.route("/imagenes/:id")
	.get(function(req,res){
		Cerveza.findById(req.params.id,function(err,imagen){
		res.render("app/imagenes/show",{imagen : imagen});
		});
		
	})
	.put(function(req,res){
	Cerveza.findById(req.params.id,function(err,imagen){
	imagen.title= req.body.title;
	imagen.save(function(err){
	if(!err){
		res.render("app/imagenes/show",{imagen : imagen});
	}else{
		res.render("app/imagenes/"+imagen.id+"/edit",{imagen : imagen});	
	}
})
		
	})
	})
	.delete(function(req,res){
		Cerveza.findOneAndRemove({},function(err){
			if(!err){
				res.redirect("/app/imagenes");
			}else{
				console.log(err);
				res.redirect("/app/imagenes/"+req.params.id);
			}
		})
	});


router.route("/imagenes")
	.get(function(req,res){
		Cerveza.find({},function(err,imagenes){
		if(err){ res.redirect("/app");return; }
		res.render("app/imagenes/index",{imagenes : imagenes});
		});
	})
	.post(function(req,res){
		var data = {
			title: req.body.title
		}

		var imagen = new Cerveza(data);

		imagen.save(function(err){
			if(!err){
				res.redirect("/app/imagenes/"+ imagen._id)
			}
			else{
				res.render(err);
			}
		});
	});











//-------------------------------------------------

router.get('/subirfoto', function(req, res, next) {
  res.render('subirfoto');
});


router.post('/subirfoto', upload.single('foto'), function(req, res, next) {
    
        //copiamos el archivo a la carpeta definitiva de fotos
       fs.createReadStream('./uploads/'+req.file.filename).pipe(fs.createWriteStream('./public/fotos/'+req.file.originalname)); 
       //borramos el archivo temporal creado
       fs.unlink('./uploads/'+req.file.filename); 

       console.log("filename" + req.file.filename);
       console.log("originalname" + req.file.originalname);
     
    var pagina='<!doctype html><html><head></head><body>'+
               '<p>Se subieron las fotos</p>'+
               '<br><a href="/">Retornar</a></body></html>';
      res.send(pagina);        
});

module.exports = router;