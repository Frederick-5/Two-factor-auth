const socket = io("/")
const ID = document.getElementById("id")

const SELECT = document.querySelector("div.select")
const EMAIL_DETAILS = document.querySelector("div.email-details")

const select_con = document.getElementById("select-con")

const email = document.getElementById("email")
const save = document.getElementById("save")
const next_mail = document.getElementById("next-mail")
const back_mail = document.getElementById("back-mail")

/**********************************SELECT */
select_con.addEventListener("click", ()=>{
    const checked = document.querySelector("div.select div.choose div.choice div.field input[name='verify']:checked")
    if(checked){
        if(checked.value == "mobile") window.location.href = `/2FA/2fa/${ID.innerText}`
        else if(checked.value == "email"){
            SELECT.style.display = "none"
            EMAIL_DETAILS.style.display = "flex"
        } 
    }
})

/*************************************EMAIL DETAILS */
back_mail.addEventListener("click", ()=>{
    EMAIL_DETAILS.style.display = "none"
    SELECT.style.display = "flex"
})

save.addEventListener("click", ()=>{
    socket.emit("update-mail", {unique: ID.innerText, email: email.value})
})

next_mail.addEventListener("click", ()=>{
    next_mail.disabled = true
    fetch(`/send-mail/${email.value}`, {
        method: "POST",
        body: "",
        headers:{
            "Content-Type":"application/json"
        } 
    }).then(res => res.text()).then((ctx)=>{
        window.location.href = `/2FA/verify-email/${email.value}/${ID.innerText}`
    }).catch(err =>{
        console.log(err)
    })
})