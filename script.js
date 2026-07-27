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
"https://script.google.com/macros/s/AKfycbz42gF4EyG0u82ZUZB6ECxLRMLzLeOce1lSFK6fYM5l-ZUnai-8IwDf0mqRqTL0NT5gDA/exec";



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









// IMAGE COMPRESSION
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error("No file provided"));
        
        let timeoutId = setTimeout(() => {
            reject(new Error("Image compression timed out. Please try a different image."));
        }, 15000);

        function finish(result) {
            clearTimeout(timeoutId);
            resolve(result);
        }

        function fail(err) {
            clearTimeout(timeoutId);
            reject(err);
        }

        if (!file.type.match(/image.*/)) {
            let reader = new FileReader();
            reader.onload = () => finish(reader.result);
            reader.onerror = () => fail(new Error("FileReader error"));
            reader.readAsDataURL(file);
            return;
        }

        let reader = new FileReader();
        reader.onload = function (readerEvent) {
            let image = new Image();
            image.onload = function () {
                try {
                    let canvas = document.createElement("canvas");
                    let width = image.width;
                    let height = image.height;

                    if (!width || !height) throw new Error("Invalid image dimensions");

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = Math.max(1, Math.floor(width));
                    canvas.height = Math.max(1, Math.floor(height));

                    let ctx = canvas.getContext("2d");
                    if (!ctx) throw new Error("Canvas 2D context not supported");
                    
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                    finish(canvas.toDataURL("image/jpeg", quality));
                } catch (e) {
                    fail(e);
                }
            };
            image.onerror = function () {
                fail(new Error("Failed to load image format"));
            };
            image.src = readerEvent.target.result;
        };
        reader.onerror = function () {
            fail(new Error("Failed to read file"));
        };
        
        try {
            reader.readAsDataURL(file);
        } catch (e) {
            fail(e);
        }
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
        let photoFile = window.croppedPhotoBlob || photoInput.files[0];
        let paymentFile = paymentInput.files[0];
        if(!photoFile || !paymentFile){
            alert("Please upload Player Photo and Payment Screenshot.");
            return;
        }

        let maxSize = 10 * 1024 * 1024; // 10MB
        if (photoFile.size > maxSize) {
            alert("❌ Player Photo is too large! Maximum 10MB image is accepted.");
            return;
        }
        if (paymentFile.size > maxSize) {
            alert("❌ Payment Screenshot is too large! Maximum 10MB image is accepted.");
            return;
        }

        let formContainer = document.getElementById("registrationForm");
        if (formContainer) {
            formContainer.style.pointerEvents = "none";
            formContainer.style.opacity = "0.7";
        }

        let button = document.getElementById("reviewBtn");
        if (button) {
            button.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> PREPARING...";
            button.disabled = true;
        }

        let photo = await compressImage(photoFile, 600, 600, 0.7);
        let payment = await compressImage(paymentFile, 800, 800, 0.7);

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
        console.error(error);
        let errorMsg = "Unknown error";
        if (error && error.message) errorMsg = error.message;
        else if (typeof error === "string") errorMsg = error;
        alert("❌ Error preparing summary: " + errorMsg);
        
        let formContainer = document.getElementById("registrationForm");
        if (formContainer) {
            formContainer.style.pointerEvents = "auto";
            formContainer.style.opacity = "1";
        }

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

        let formContainer = document.getElementById("registrationForm");
        if (formContainer) {
            formContainer.style.pointerEvents = "auto";
            formContainer.style.opacity = "1";
        }
        
        let button = document.getElementById("reviewBtn");
        if (button) {
            button.disabled = false;
            button.innerHTML = "REVIEW & SUBMIT";
        }
    }
});

// Loading Modal Logic
function showLoadingModal(message) {
    let modal = document.getElementById("loadingOverlayModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "loadingOverlayModal";
        modal.style.position = "fixed";
        modal.style.inset = "0";
        modal.style.background = "rgba(0,0,0,0.85)";
        modal.style.display = "none";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "999999";
        modal.style.backdropFilter = "blur(8px)";
        modal.innerHTML = `
            <div class="custom-alert-box" style="text-align:center; padding: 40px;">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite; margin-bottom: 20px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
                <h3 id="loadingOverlayMessage" style="color:var(--gold); font-size:18px; font-weight:600; margin:0;"></h3>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById("loadingOverlayMessage").innerHTML = message;
    modal.style.display = "flex";
}

function updateLoadingModal(message) {
    let msgEl = document.getElementById("loadingOverlayMessage");
    if (msgEl) msgEl.innerHTML = message;
}

function hideLoadingModal() {
    let modal = document.getElementById("loadingOverlayModal");
    if (modal) modal.style.display = "none";
}

// Final Submit Logic
document.addEventListener("click", async function(e) {
    if (e.target.id === "finalSubmitBtn") {
        let btn = e.target;
        if(btn.disabled) return;
        btn.disabled = true;
        
        alert("I confirm that all provided information is accurate to the best of my knowledge and no data tempering has been done.");
        
        showLoadingModal("Securing slot...");
        
        let loadingMessages = [
            "Uploading player photo...",
            "Verifying payment...",
            "Finalizing details...",
            "Almost done..."
        ];
        
        let msgIndex = 0;
        let loadingInterval = setInterval(() => {
            if (msgIndex < loadingMessages.length) {
                updateLoadingModal(loadingMessages[msgIndex]);
                msgIndex++;
            }
        }, 2000);
        
        try {
            let response = await fetch(scriptURL, {
                method: "POST",
                body: JSON.stringify(window.registrationData)
            });
            
            let result = await response.json();
            
            clearInterval(loadingInterval);
            hideLoadingModal();
            
            if(result.status === "duplicate"){
                alert("❌ This mobile number is already registered.");
                btn.disabled = false;
                btn.innerHTML = "CONFIRM";
                return;
            }
            
            if(result.status === "full"){
                alert("❌ All 64 player slots are filled.");
                btn.disabled = false;
                btn.innerHTML = "CONFIRM";
                return;
            }
            
            if(result.status === "success"){
                alert("✅ Registration Successful!\n\nYour Player ID: " + result.id + "\n\nStatus: Pending Verification");
                
                let formContainer = document.getElementById("registrationForm");
                if (formContainer) {
                    formContainer.reset();
                    formContainer.style.pointerEvents = "auto";
                    formContainer.style.opacity = "1";
                }
                
                // Clear custom selects
                let selectedDivs = document.getElementsByClassName("select-selected");
                let selects = document.getElementsByTagName("select");
                for(let i=0; i<selects.length; i++) {
                     if (selectedDivs[i] && selects[i].options && selects[i].options.length > 0) {
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
            btn.innerHTML = "CONFIRM";
        }
        catch (error) {
            console.log(error);
            clearInterval(loadingInterval);
            hideLoadingModal();
            alert("❌ Registration failed. Please try again.");
            
            btn.disabled = false;
            btn.innerHTML = "CONFIRM";
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

    if (localStorage.getItem("rulesAccepted") === "true") {
        if (rulesPopup) rulesPopup.style.display = "none";
        if (checkRegistrationDeadline()) {
            if (registrationForm) {
                registrationForm.style.display = "block";
                registrationForm.classList.add("form-appear-animation");
            }
        }
    }

    continueBtn.addEventListener("click", function(){
        if(!agreeCheck.checked){
            alert("Please accept the rules & regulations first.");
            return;
        }

        if (!checkRegistrationDeadline()) {
            return; 
        }
        
        localStorage.setItem("rulesAccepted", "true");

        rulesPopup.style.display = "none";
        registrationForm.style.display = "block";
        registrationForm.classList.add("form-appear-animation");

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    });
});

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