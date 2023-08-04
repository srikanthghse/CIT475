
const express = require('express');
const app = express();
const port = 3000; 
const bodyParser = require('body-parser');
const Redis = require('redis');
const { createHash } = require('node:crypto');
const fs = require('fs')
const https = require('https')
const redisClient = Redis.createClient();//this creates a pending connection to redis


app.use(bodyParser.json()); //allow JSON (Javascript Object Notation) requests

// app.listen(port, ()=> {
//     redisClient.connect();
//     console.log("Listening on port: " + port);
// });

//The below code is upto lesson 7.1 from lesson 7.2 the code will be modified as below code in colour
// https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
//   }, app).listen(3000, () => {
//     console.log('Listening...')
//   })

https.createServer(
    {
        key: fs.readFileSync('/etc/letsencrypt/archive/srikanthgubbala.cit270.com/privkey1.pem'), //This is a private key
        cert: fs.readFileSync('/etc/letsencrypt/archive/srikanthgubbala.cit270.com/cert1.pem'), //This is a signed certificate
        chain: fs.readFileSync('/etc/letsencrypt/archive/srikanthgubbala.cit270.com/fullchain1.pem') //This is the certificate chain
    },
    app
).listen(port, ()=>{
    redisClient.connect();
    console.log('Listening on port: '+port);
});

// app.get('/', (req, res) => {
//     res.send("<h1>Welcome to your Node Server!</h1>"); 
// });

// To allow the user to send thier uername and pasword,
// we must create a psot endpoint in the server.js file
app.post('/signup',async(req,res)=>{
    const loginBody = req.body;
    const userName = loginBody.userName;
    const password = loginBody.password;
    const hashedPassword = password==null? null : createHash('sha3-256').update(password).digest('hex');

    if(userName!=null && password!=null){
        await redisClient.hSet('hashedpasswords',userName,hashedPassword);
        res.send("Added user: "+userName);

    } else{
        res.status(400);
        res.send("Null userName or password -- user not added.")
    }
    
}); 

//For the hashing lesson in week 5 this is the /login code:
app.post('/login',async (req,res)=>{
    const loginBody = req.body;
    const userName = loginBody.userName;
    const password = loginBody.password;//we need to hash the password the user gave us
    const hashedPassword = password==null? null : createHash('sha3-256').update(password).digest('hex');
    console.log("Hashed Password: "+hashedPassword);
    const redisPassword = password==null ? null : await redisClient.hGet('hashedpasswords',userName);
    console.log("Redis Password for: "+userName+": "+redisPassword);
    if (password!=null && hashedPassword===redisPassword){
        //this happens if the password is correct
        res.send("Welcome "+userName);
    } else {
        //this happens if the password is not correct
        res.status(401);//unauthorized
        res.send("Incorrect password");
    }
 
});



