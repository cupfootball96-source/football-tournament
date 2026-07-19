// ===============================
// NGC 2026 SCRIPT
// ===============================




// =====================================
// NGC 2026 COUNTDOWN
// =====================================










// GOOGLE APPS SCRIPT URL

const scriptURL = 
"https://script.google.com/macros/s/AKfycbzR7CAKGA654uYzwks5wt12OrKYiYHLFaaH6HABdIZJTYPll1gRCvoaZxNkrZ9QOtKGLA/exec";



// =====================================
// REGISTRATION DEADLINE
// =====================================

const registrationDeadline = new Date("August 5, 2026 23:59:59").getTime();


function checkRegistrationDeadline(){

    let today = new Date().getTime();


    if(today > registrationDeadline){

        alert(
        "❌ Registration Closed.\n\nLast date was 5 August 2026."
        );

        return false;

    }


    return true;

}




// AGE CALCULATION


document.getElementById("dob")?.addEventListener("change",function(){


    let dob = new Date(this.value);

    let today = new Date();


    let age =
    today.getFullYear() - dob.getFullYear();


    let month =
    today.getMonth() - dob.getMonth();



    if(
        month < 0 ||
        (month === 0 && today.getDate() < dob.getDate())
    ){

        age--;

    }



    let result =
    document.getElementById("ageResult");



    if(result){


        if(age < 16){


            result.innerHTML =
            "❌ Minimum age requirement is 16 years";


            result.style.color="red";


        }

        else{


            result.innerHTML =
            "✅ Age Eligible: "+age+" years";


            result.style.color="#00ff66";


        }

    }



});









// FILE TO BASE64


function fileToBase64(file){


    return new Promise((resolve,reject)=>{


        let reader = new FileReader();


        reader.onload=function(){

            resolve(reader.result);

        };


        reader.onerror=function(){

            reject();

        };


        reader.readAsDataURL(file);


    });


}









// FORM SUBMIT


let form =
document.getElementById("registrationForm");



if(form){



form.addEventListener("submit",async function(e){


e.preventDefault();


let lastDate = new Date("August 5, 2026 23:59:59");
let todayDate = new Date();

if(todayDate > lastDate){

    alert("❌ Registration Closed. Last date was 5 August 2026.");

    return;

}

try{



// DOB CHECK


let dob =
new Date(
document.getElementById("dob").value
);



let today =
new Date();



let age =
today.getFullYear() -
dob.getFullYear();



let month =
today.getMonth() -
dob.getMonth();



if(
month < 0 ||
(month === 0 && today.getDate() < dob.getDate())
){

age--;

}




if(age < 16){


alert(
"❌ Player age must be 16 or above."
);


return;


}






// FILE GET


let photoInput =
document.getElementById("playerPhoto");



let paymentInput =
document.getElementById("paymentScreenshot");





if(!photoInput || !paymentInput){


alert(
"File input ID missing. Check HTML."
);


return;


}





let photoFile =
photoInput.files[0];



let paymentFile =
paymentInput.files[0];





if(!photoFile || !paymentFile){


alert(
"Please upload Player Photo and Payment Screenshot."
);


return;


}





// BUTTON LOADING


let button =
form.querySelector("button");


button.innerHTML =
"SUBMITTING...";


button.disabled=true;






// CONVERT FILES


let photo =
await fileToBase64(photoFile);



let payment =
await fileToBase64(paymentFile);








// DATA


let data = {


name:
document.getElementById("playerName").value,


dob:
document.getElementById("dob").value,


age:
age,


mobile:
document.getElementById("mobile").value,


position:
document.querySelector("select").value,


utr:
document.querySelector(
'input[placeholder="Enter UTR Number"]'
).value,


photo:
photo,


payment:
payment


};







// SEND


let response =
await fetch(scriptURL,{


method:"POST",


body:
JSON.stringify(data)


});





let result =
await response.json();







if(result.status==="duplicate"){


alert(
"❌ This mobile number is already registered."
);


button.disabled=false;

button.innerHTML =
"SUBMIT REGISTRATION";


return;


}





if(result.status==="full"){


alert(
"❌ All 64 player slots are filled."
);


button.disabled=false;

button.innerHTML =
"SUBMIT REGISTRATION";


return;


}





if(result.status==="success"){



alert(

"✅ Registration Successful!\n\n"+
"Your Player ID: "+
result.id+
"\n\nStatus: Pending Verification"

);



form.reset();



}




button.disabled=false;

button.innerHTML =
"SUBMIT REGISTRATION";






}

catch(error){


console.log(error);



alert(
"❌ Registration failed. Please try again."
);



let button =
form.querySelector("button");


button.disabled=false;

button.innerHTML =
"SUBMIT REGISTRATION";



}



});



}

document.addEventListener("DOMContentLoaded", function(){

    const rulesPopup = document.getElementById("rulesPopup");
    const agreeCheck = document.getElementById("agreeCheck");
    const continueBtn = document.getElementById("continueBtn");
    const registrationForm = document.getElementById("registrationForm");


    if(registrationForm){
        registrationForm.style.display = "none";
    }


    continueBtn.addEventListener("click", function(){


        if(!agreeCheck.checked){

            alert("Please accept the rules & regulations first.");
            return;

        }


        rulesPopup.style.display = "none";


        registrationForm.style.display = "block";


        window.scrollTo({
            top:0,
            behavior:"smooth"
        });


    });


});
let deadline = new Date("August 5, 2026 23:59:59").getTime();

let today = new Date().getTime();


if(today > deadline){

alert("❌ Registration Closed");

document.getElementById("registrationForm").style.display="none";

}
// MULTIPLE QR ROTATION

const qrList = [

"assets/qrr1.png",
"assets/qrr2.png",
"assets/qrr3.png",
"assets/qrr4.png"

];


let qrIndex = 0;


setInterval(()=>{


qrIndex++;


if(qrIndex >= qrList.length){

    qrIndex = 0;

}


document.getElementById("paymentQR").src =
qrList[qrIndex];


},300000);