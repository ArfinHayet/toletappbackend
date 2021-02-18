const express = require('express')
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken')
const path= require('path')
const hbs = require('hbs')
const cors= require('cors')
const mysql= require('mysql')
const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(fileUpload());


const db = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'houselet'

})

const publicDirectory= path.join(__dirname+'/public');
console.log(publicDirectory);
app.use(express.static(publicDirectory));

app.use('/images', express.static(publicDirectory+'/images'));
console.log(publicDirectory)

app.use(cors({
	origin:'http://localhost:3000',
	credentials: true,
}))


app.get("/", (req,res)=>{
    res.render("index")
})

app.get("/arfin",(req,res)=>{
	res.send('Hey');   
})

app.post("/houselet",(req,res)=>{
	const { type } = req.body;
	db.query("SELECT *FROM posts WHERE type=?",type,(err,results)=>{
      res.json({'row':results});
	})
})
  
app.post("/sendval",(req,res)=>{
    const {name,password} = req.body;
    const id = 5;

    const token = jwt.sign({id},'mysupersecretpassword',{
    	expiresIn : '90d'
    })

    console.log("Token is "+token)



    res.json(
    	{
    		'name':name, 
    		'pass':password,
    		'token': token,
    	}
    )
})

app.post("/auth",(req,res)=>{
	const {token}=req.body;

    if(token){
		jwt.verify(token,'mysupersecretpassword',(err,decoded)=>{
			if(err) {
				res.json({auth:false});
			}
			else {
			const uid = decoded.id;
			console.log("I have my id  "+uid);
			res.json({auth:true});
		  }
		})
	} else {
	   res.json({auth:false});
	}
})


app.post("/postadd", async (req,res)=>{    
	  const {name,type} = req.body;

	  var file = req.files.foo;
	  var filename = file.name;
	  console.log(file)
	  file.mv(publicDirectory+'/images/'+filename,(err)=>{
	    if(err){
	      console.log(err);
	    } else {
	      console.log('File Upload');
	    }
	  })
	
	db.query("INSERT INTO posts SET ?",{name:name,type:type,photo:filename},(err,results)=>{
		if(err){
			res.json({'message':false})
			console.log(err)
		} else {
            res.json({'message':true})
		}
	})
})

app.post("/fetch",(req,res)=>{
	const {id}=req.body;
	console.log(id)
	res.json({'message':'works'})
})


app.set('view engine','hbs');
app.listen(5000,(req,res)=>{
	console.log('Server runing on 5000')        
})