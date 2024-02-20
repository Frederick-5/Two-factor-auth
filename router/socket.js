const {io} = require("../app")
const {User, bcrypt} = require("./database")

io.on("connection",(socket)=>{
    console.log(socket.id,"is connected")

    socket.on("signup_data",async (data)=>{
        const check = await User.findOne({username:data.username})
        if(!check){
          return
        }else{
          io.to(socket.id).emit("error",`Username ${data.username} already in use`)
        }
    })

    socket.on("login_data",async (data)=>{
      const check = await User.find({username:data.username})
      if(check.length > 0){
        if(await bcrypt.compare(data.password,check[0].password)){
            return
        }
        else{
          io.to(socket.id).emit("error","Please check username or password")
        }
      }else{
        io.to(socket.id).emit("error","Please check username or password")
      }
   })

   socket.on("update-mail", async (data)=>{
    await User.findOneAndUpdate({unique: data.unique},{email: data.email})
    console.log("email updated")
   })
})

module.exports = io