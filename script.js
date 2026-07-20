// ===============================
// NGC 2026 SCRIPT
// ===============================

// =====================================
// CUSTOM ALERT MODAL OVERRIDE
// =====================================
function showCustomAlert(message) {
    let modal = document.getElementById("customAlertModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "customAlertModal";
        modal.innerHTML = `
            <div class="custom-alert-box">
                <p id="customAlertMessage"></p>
                <button type="button" id="customAlertBtn">OK</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("customAlertBtn").addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    document.getElementById("customAlertMessage").innerHTML = message.replace(/\n/g, "<br>");
    modal.style.display = "flex";
}

window.alert = function(msg) {
    showCustomAlert(msg);
};

// =====================================
// CUSTOM DROPDOWN LOGIC
// =====================================
function initCustomSelect() {
    let x = document.getElementsByTagName("select");
    for (let i = 0; i < x.length; i++) {
        let selElement = x[i];
        
        if (selElement.parentElement.className !== "custom-select-wrapper") {
            let wrapper = document.createElement("div");
            wrapper.setAttribute("class", "custom-select-wrapper");
            selElement.parentNode.insertBefore(wrapper, selElement);
            wrapper.appendChild(selElement);
            
            let a = document.createElement("div");
            a.setAttribute("class", "select-selected");
            a.innerHTML = selElement.options[selElement.selectedIndex].innerHTML;
            wrapper.appendChild(a);

            let b = document.createElement("div");
            b.setAttribute("class", "select-items select-hide");
            
            for (let j = 0; j < selElement.length; j++) {
                if (j === 0 && selElement.options[j].value === "") continue; 
                let c = document.createElement("div");
                c.innerHTML = selElement.options[j].innerHTML;
                
                if(j === selElement.selectedIndex) c.classList.add("same-as-selected");

                c.addEventListener("click", function(e) {
                    let y, i, k, s, h;
                    s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                    h = this.parentNode.previousSibling;
                    for (i = 0; i < s.length; i++) {
                        if (s.options[i].innerHTML == this.innerHTML) {
                            s.selectedIndex = i;
                            h.innerHTML = this.innerHTML;
                            let event = new Event('change');
                            s.dispatchEvent(event);
                            
                            y = this.parentNode.getElementsByClassName("same-as-selected");
                            for (k = 0; k < y.length; k++) {
                                y[k].classList.remove("same-as-selected");
                            }
                            this.classList.add("same-as-selected");
                            break;
                        }
                    }
                    h.click();
                });
                b.appendChild(c);
            }
            wrapper.appendChild(b);

            a.addEventListener("click", function(e) {
                e.stopPropagation();
                closeAllSelect(this);
                this.nextSibling.classList.toggle("select-hide");
                this.classList.toggle("select-arrow-active");
                this.parentElement.classList.toggle("active");
            });
        }
    }
}

function closeAllSelect(elmnt) {
    let x = document.getElementsByClassName("select-items");
    let y = document.getElementsByClassName("select-selected");
    let arrNo = [];
    for (let i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i);
        } else {
            y[i].classList.remove("select-arrow-active");
            y[i].parentElement.classList.remove("active");
        }
    }
    for (let i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i) === -1) {
            x[i].classList.add("select-hide");
        }
    }
}

document.addEventListener("click", closeAllSelect);

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

function calculateAge(dobString) {
    if (!dobString) return 0;
    let dob = new Date(dobString);
    let today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    let month = today.getMonth() - dob.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

document.getElementById("dob")?.addEventListener("change",function(){

    let age = calculateAge(this.value);



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



form.addEventListener("submit", async function(e){
    e.preventDefault();
    if (!checkRegistrationDeadline()) {
        return;
    }
    try{
        let age = calculateAge(document.getElementById("dob").value);
        if(age < 16){
            alert("❌ Player age must be 16 or above.");
            return;
        }

        let photoInput = document.getElementById("playerPhoto");
        let paymentInput = document.getElementById("paymentScreenshot");
        if(!photoInput || !paymentInput){
            alert("File input ID missing. Check HTML.");
            return;
        }
        let photoFile = photoInput.files[0];
        let paymentFile = paymentInput.files[0];
        if(!photoFile || !paymentFile){
            alert("Please upload Player Photo and Payment Screenshot.");
            return;
        }

        let button = document.getElementById("reviewBtn");
        if (button) {
            button.innerHTML = "PREPARING...";
            button.disabled = true;
        }

        let photo = await fileToBase64(photoFile);
        let payment = await fileToBase64(paymentFile);

        window.registrationData = {
            name: document.getElementById("playerName").value,
            dob: document.getElementById("dob").value,
            age: age,
            mobile: document.getElementById("mobile").value,
            position: document.getElementById("position").value,
            foot: document.getElementById("foot").value,
            experience: document.getElementById("experience").value,
            utr: document.getElementById("utr").value,
            photo: photo,
            payment: payment
        };

        // Populate Summary
        document.getElementById("summaryPhoto").src = photo;
        document.getElementById("summaryName").innerText = window.registrationData.name;
        document.getElementById("summaryPosition").innerText = window.registrationData.position;
        document.getElementById("summaryAge").innerText = window.registrationData.age;
        document.getElementById("summaryFoot").innerText = window.registrationData.foot;
        document.getElementById("summaryExp").innerText = window.registrationData.experience;

        // Show Summary Modal
        document.getElementById("summaryModal").style.display = "flex";
        document.body.style.overflow = "hidden";
        let logoLink = document.querySelector(".logo");
        if(logoLink) logoLink.style.pointerEvents = "none";

        if (button) {
            button.innerHTML = "REVIEW & SUBMIT";
            button.disabled = false;
        }
    }
    catch(error){
        console.log(error);
        alert("❌ Error preparing summary: " + (error.message || "Unknown error"));
        let button = document.getElementById("reviewBtn");
        if (button) {
            button.disabled = false;
            button.innerHTML = "REVIEW & SUBMIT";
        }
    }
});

// Modal Button Actions
document.addEventListener("click", function(e) {
    
    // Explicit "Edit Data" button logic
    if (e.target.id === "editDataBtn") {
        document.getElementById("summaryModal").style.display = "none";
        document.body.style.overflow = "auto";
        let logoLink = document.querySelector(".logo");
        if(logoLink) logoLink.style.pointerEvents = "auto";
    }
});

// Final Submit Logic
document.addEventListener("click", async function(e) {
    if (e.target.id === "finalSubmitBtn") {
        let btn = e.target;
        if(btn.disabled) return;
        btn.disabled = true;
        
        alert("I confirm that all provided information is accurate to the best of my knowledge and no data tempering has been done.");
        
        btn.innerHTML = "SUBMITTING...";
        
        try {
            let response = await fetch(scriptURL, {
                method: "POST",
                body: JSON.stringify(window.registrationData)
            });
            
            let result = await response.json();
            
            if(result.status === "duplicate"){
                alert("❌ This mobile number is already registered.");
                btn.disabled = false;
                btn.innerHTML = "CONFIRM & REGISTER";
                return;
            }
            
            if(result.status === "full"){
                alert("❌ All 64 player slots are filled.");
                btn.disabled = false;
                btn.innerHTML = "CONFIRM & REGISTER";
                return;
            }
            
            if(result.status === "success"){
                alert("✅ Registration Successful!\n\nYour Player ID: " + result.id + "\n\nStatus: Pending Verification");
                document.getElementById("registrationForm").reset();
                
                // Clear custom selects
                let selectedDivs = document.getElementsByClassName("select-selected");
                let selects = document.getElementsByTagName("select");
                for(let i=0; i<selects.length; i++) {
                     if (selectedDivs[i] && selects[i].options.length > 0) {
                         selectedDivs[i].innerHTML = selects[i].options[0].innerHTML;
                     }
                }
                
                document.getElementById("summaryModal").style.display = "none";
                document.body.style.overflow = "auto";
                let logoLink = document.querySelector(".logo");
                if(logoLink) logoLink.style.pointerEvents = "auto";
                window.registrationData = null;
            }
            
            btn.disabled = false;
            btn.innerHTML = "CONFIRM & REGISTER";
        }
        catch (error) {
            console.log(error);
            alert("❌ Registration failed. Please try again.");
            btn.disabled = false;
            btn.innerHTML = "CONFIRM & REGISTER";
        }
    }
});



}

document.addEventListener("DOMContentLoaded", function(){

    const rulesPopup = document.getElementById("rulesPopup");
    const agreeCheck = document.getElementById("agreeCheck");
    const continueBtn = document.getElementById("continueBtn");
    const registrationForm = document.getElementById("registrationForm");
    
    // Init Custom Dropdowns
    initCustomSelect();
    
    // Init Flatpickr Date Picker
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#dob", {
            dateFormat: "Y-m-d",
            maxDate: "today",
            disableMobile: "true"
        });
    }
    
    // Language Toggle
    const btnHinglish = document.getElementById("btnHinglish");
    const btnEnglish = document.getElementById("btnEnglish");
    const rulesHinglish = document.getElementById("rulesHinglish");
    const rulesEnglish = document.getElementById("rulesEnglish");

    if(btnHinglish && btnEnglish){
        btnHinglish.addEventListener("click", function(){
            btnHinglish.classList.add("active");
            btnEnglish.classList.remove("active");
            rulesHinglish.style.display = "block";
            rulesEnglish.style.display = "none";
        });
        
        btnEnglish.addEventListener("click", function(){
            btnEnglish.classList.add("active");
            btnHinglish.classList.remove("active");
            rulesEnglish.style.display = "block";
            rulesHinglish.style.display = "none";
        });
    }


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
        registrationForm.classList.add("form-appear-animation");


        window.scrollTo({
            top:0,
            behavior:"smooth"
        });


    });


});
if(!checkRegistrationDeadline()){
    let regForm = document.getElementById("registrationForm");
    if (regForm) regForm.style.display = "none";
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