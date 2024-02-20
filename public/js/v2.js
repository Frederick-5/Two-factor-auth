const OTP_code = document.getElementById("otp-code")

OTP_code.addEventListener("input", ()=>{
    if(OTP_code.value.length > OTP_code.maxLength){
        OTP_code.value = OTP_code.value.slice(0, OTP_code.maxLength)
    }
})