const router = require("express").Router()
const User = require("./database").User
const bcrypt = require("./database").bcrypt
const nodemailer = require("nodemailer")
const {v4} = require("uuid")
const otp = require("otp-generator")
const speakeasy = require("speakeasy")
const qrcode = require("qrcode")
require("dotenv").config()


/**************************LOGIN****** */
router.get("/login", (request, response)=>{
    response.render("login")
})
router.post("/logout", (request, response)=>{
    request.session.destroy((err)=>{
        if(err) console.log(err)
        else console.log("User logged out")
    })
    response.redirect("/login")
})
router.post("/login", async (request, response)=>{
    try{
        let check = await User.find({username:request.body.username})
        if(check.length > 0){
            if(await bcrypt.compare(request.body.password,check[0].password)){
                response.redirect(`/2FA/${check[0].unique}`)
            }else{
                response.status(204).send()
            }
        }else{
            response.status(204).send()
        }
    }catch(err){
        console.log(err)
    }
})

/**************************SIGNUP****** */
router.get("/signup", (request, response)=>{
    response.render("signup")
})
router.post("/signup", async (request, response)=>{
    try{
        let secret = speakeasy.generateSecret({
            name: request.body.username
        })      
        let unique = v4()
        let check = await User.findOne({username:request.body.username})
        let salt = await bcrypt.genSalt()
        let hashPassword = await bcrypt.hash(request.body.password,salt)
        if(!check){
            const newUser = new User({
                firstname:request.body.firstname,
                lastname:request.body.lastname,
                email:request.body.email,
                username:request.body.username,
                password: hashPassword,
                TFA_enabled: false,
                unique: unique,
                secret: JSON.stringify(secret)
            })
            await newUser.save().then((model)=>{
                console.log()
                response.redirect(`/2FA/${model.unique}`)
            })
        }else{
            console.log("nope")
            response.status(204).send()
        }
    }catch(err){
        console.log(err)
    }
})

/*************************2FA */
router.get("/2FA/:id", async (request, response)=>{
    const check = await User.findOne({unique: request.params.id})
    if(check) response.render("2FA", {email: check.email, id: request.params.id})
    else response.redirect("/login")
})

/*******************VERIFICATION OF EMAIL********************/
router.get("/2FA/verify-email/:email/:id", async (request, response)=>{
    const check = await User.findOne({unique: request.params.id})
    if(check) response.render("verify-email", {email: request.params.email, id: request.params.id})
    else response.redirect("/login")
})
router.post("/send-mail/:email", async (request, response)=>{
    const OTP = otp.generate(6, {digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "favcon.io@gmail.com",
            pass: process.env.PASSWORD
        }
    })
    const mail = {
        from: "favcon.io@gmail.com",
        to: request.params.email,
        subject: "Authentication Code for Account Verification",
        html: `Your one-time password is: <h1>${OTP}</h1>. Please enter this code to verify your identity. Do not share this code with anyone`
    }
    transport.sendMail(mail,(err, info)=>{
        if (err) console.log(err)
        else{
            console.log("Mail sent successfully")
            request.session.OTP = OTP
            response.status(204).send()
        }
    })
})
router.post("/2FA/verify-email/:email/:id", async (request, response)=>{
    if(request.session.OTP == request.body.otp){
        request.session.unique = request.params.id
        response.redirect("/page")
    }else{
        response.render("verify-email", {email: request.params.email, message: "Incorrect OTP code"})
    }
})

/****************************************2FA VERIFICATION */
router.get("/2FA/2fa/:id", async (request, response)=>{
    const check = await User.findOne({unique: request.params.id})
    if(check){
        const secret = JSON.parse(check.secret)
        const enabled = (check.TFA_enabled)? "none": "flex"
        qrcode.toDataURL(secret.otpauth_url, (err, data)=>{
            response.render("auth", {qrcode: data, secret: secret.base32, display: enabled, id: request.params.id})
        })
    }else{
        response.redirect("/login")
    }
})
router.post("/2FA/2fa/:id", async (request, response)=>{
    const check = await User.findOne({unique: request.params.id})
    if(check){
        const secret = JSON.parse(check.secret)
        const verify = speakeasy.totp.verify({
            secret: secret.ascii,
            encoding: "ascii",
            token: request.body.otp.toString()
        })
        if(verify){
            if(!check.TFA_enabled) await User.findOneAndUpdate({unique: request.params.id},{TFA_enabled: true})
            request.session.unique = request.params.id
            response.redirect("/page")
        }else{
            const enabled = (check.TFA_enabled)? "none": "flex"
            if(!check.TFA_enabled){
                qrcode.toDataURL(secret.otpauth_url, (err, data)=>{
                    response.render("auth", {qrcode: data, secret: secret.ascii, display: enabled, id: request.params.id, message: "Incorrect OTP code"})
                })
            }else{
                response.render("auth", {id: request.params.id, message: "Incorrect OTP code"})
            }
        }
    }else{
        response.redirect("/login")
    }
})

function checkSignIn(request, response, next){
    if(request.session.unique){
        next()
    }else{
        const err = new Error("Not logged in")
        next(err)
    }
}
router.get("/page", checkSignIn, async (request, response)=>{
    const check = await User.findOne({unique: request.session.unique})
    const char = check.username.charAt(0)
    response.render("page", {char})
})
router.use("/page", (err, request, response, next)=>{
    if(err) response.redirect("/login")
})

module.exports = router