const fullname = document.getElementById("fullname")
const username = document.getElementById("username")
const email = document.getElementById("email")
const password = document.getElementById("password")
const view_pass = document.getElementById("view-pass")
const warn = document.getElementById("warn")
const submit = document.getElementById("submit")
const load = document.getElementById("loading")
const socket = io("/")

function toggle(view,pass){
    if(pass.type =="password"){
        pass.type = "text"
        view.src = "../img/hide.png"
    }else{
        pass.type = "password"
        view.src = "../img/view.png"
    }
}
view_pass.onclick = ()=>{
    toggle(view_pass,password)
}
password.addEventListener("input",()=>{
    let value = password.value
    let special_charac = ["@",".","#","$","%","^","*","(",")","!","-","_","+","=","{","}","[","]","|",";",":","'",'"',"<",">","?",",","/","~"]
    let numbers = ["1","2","3","4","5","6","7","8","9","0"]

    let isCharacter = special_charac.some(charac => value.includes(charac))
    let isNumber = numbers.some(num => value.includes(num))

    if(value.length > 8){
        warn.innerText = null
        submit.disabled = false

        if(isCharacter && isNumber){
            warn.innerText = null
            submit.disabled = false
        }else{
            warn.innerText = "Password must contain special characters and numbers"
            submit.disabled = true
        }
    }else{
        warn.innerText = "Password must contain at least 8 characters"
        submit.disabled = true
    }
})

submit.addEventListener("click",(e)=>{
    socket.emit("signup_data",{username: username.value})
    
    if(fullname.value && email.value && username.value && password.value){
        load.style.display = "flex"
        submit.value = " "
    }
})
socket.on("error",(err)=>{
    warn.innerText = err
    load.style.display = "none"
    submit.value = "Create Account"
})