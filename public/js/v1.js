const socket = io("/")
const gmail = document.getElementById("gmail")
const OTP_mail = document.getElementById("otp-mail")
const verify_mail = document.getElementById("verify-mail")
const resend = document.getElementById("resend")


OTP_mail.addEventListener("input", ()=>{
    if(OTP_mail.value.length > OTP_mail.maxLength){
        OTP_mail.value = OTP_mail.value.slice(0, OTP_mail.maxLength)
    }
}) 
resend.addEventListener("click", ()=>{
    resend.style.display = "none"
    fetch(`/send-mail/${gmail.innerText}`, {
        method: "POST",
        body: "",
        headers:{
            "Content-Type":"application/json"
        } 
    }).then(res => res.text()).then((ctx)=>{
        resend.style.display = "block"
    }).catch(err =>{
        console.log(err)
    })
})