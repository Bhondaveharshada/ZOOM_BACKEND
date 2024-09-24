const http = require("http")
const port = 4000
const app = require("./app")



const myServer = http.createServer(app)

myServer.listen(port, ()=>{
    console.log("Server started at port:",port);
    
})