// ======================================
// NEW ERA CUP ADMIN DASHBOARD
// dashboard.js
// ======================================

// ======================================
// WEB APP URL
// ======================================

const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbz42gF4EyG0u82ZUZB6ECxLRMLzLeOce1lSFK6fYM5l-ZUnai-8IwDf0mqRqTL0NT5gDA/exec";


// ======================================
// WINDOW LOAD
// ======================================

window.addEventListener("load", () => {

    initSearch();
    initFilters();
    loadDashboard();

});


// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard(){

    showLoader();

    try{

    await Promise.all([

        loadStats(),

        loadPendingPlayers(),

        loadApprovedPlayers(),

        loadRejectedPlayers()

    ]);

}

catch(err){

    console.error(err);

    showToast(

        "Dashboard Load Failed",

        "error"

    );

}

finally{

    hideLoader();

}
}


// ======================================
// LOAD STATS
// ======================================

async function loadStats(){

    const response =
    await fetch(

        WEB_APP_URL +

        "?action=getStats"

    );

    const data =
    await response.json();

    document.getElementById("pending").textContent =
    data.pending;

    document.getElementById("approved").textContent =
    data.approved;

    document.getElementById("rejected").textContent =
    data.rejected;

    document.getElementById("remaining").textContent =
    64 - data.approved;

}


// ======================================
// LOADER
// ======================================

function showLoader(){

    const loader =
    document.getElementById("loader");

    if(loader){

        loader.style.display="flex";

    }

}

function hideLoader(){

    const loader =
    document.getElementById("loader");

    if(loader){

        loader.style.display="none";

    }

}


// ======================================
// TOAST
// ======================================

function showToast(message,type="success"){

    const toast =
    document.getElementById("toast");

    if(!toast) return;

    toast.innerHTML=message;

    toast.style.display="block";

    if(type==="success"){

        toast.style.background="#00C853";

    }

    else{

        toast.style.background="#E53935";

    }

    setTimeout(()=>{

        toast.style.display="none";

    },3000);

}
// ======================================
// LOAD PENDING PLAYERS
// ======================================

async function loadPendingPlayers(){

    const response = await fetch(
        WEB_APP_URL + "?action=getPlayers"
    );

    const players = await response.json();

    const table = document.getElementById("playerTable");

    table.innerHTML = "";

    if(players.length===0){

        table.innerHTML = `
        <tr>
            <td colspan="11">No Pending Players</td>
        </tr>
        `;

        return;

    }

    players.forEach(player=>{

        table.innerHTML += `

<tr>

<td>${player.id}</td>

<td>

<img
src="${getDirectImageUrl(player.photo)}"
style="width:55px;height:55px;border-radius:10px;cursor:pointer"
onclick="previewImage('${getDirectImageUrl(player.photo)}')">

</td>

<td>${player.name}</td>

<td>${player.age}</td>

<td>${player.position}</td>

<td>${player.utr}</td>

<td>${player.mobile}</td>

<td>

<button
onclick="previewImage('${player.payment}')">

View

</button>

</td>

<td>

<span class="badge pending">

Pending

</span>

</td>

<td>

${formatDate(player.date)}

</td>

<td>

<button
class="approve-btn"
onclick="approvePlayer(${player.row})">

Approve

</button>

<button
class="reject-btn"
onclick="rejectPlayer(${player.row})">

Reject

</button>

</td>

</tr>

`;

    });

}


// ======================================
// Helper to convert Google Drive URL to direct image URL
const getDirectImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop';
    if (url.includes('/d/')) {
        const parts = url.split('/d/');
        if (parts.length > 1) {
            const id = parts[1].split('/')[0];
            return "https://lh3.googleusercontent.com/d/" + id + "=w600";
        }
    }
    return url;
};

// ======================================
// DATE FORMAT
// ======================================

function formatDate(value){

    if(!value) return "";

    const date = new Date(value);

    return date.toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}
// ======================================
// LOAD APPROVED PLAYERS
// ======================================

async function loadApprovedPlayers(){

    const response = await fetch(

        WEB_APP_URL +

        "?action=getApprovedPlayers"

    );

    const players = await response.json();

    const table =
    document.getElementById("approvedTable");

    table.innerHTML = "";

    if(players.length==0){

        table.innerHTML=`

        <tr>

        <td colspan="7">

        No Approved Players

        </td>

        </tr>

        `;

        return;

    }

    players.forEach(player=>{

        table.innerHTML += `

<tr>

<td>

${player.id}

</td>

<td>

<img
src="${getDirectImageUrl(player.photo)}"
style="width:55px;height:55px;border-radius:10px;cursor:pointer"
onclick="previewImage('${getDirectImageUrl(player.photo)}')">

</td>

<td>

${player.name}

</td>

<td>

${player.position}

</td>

<td>

${player.mobile}

</td>

<td>

<span class="badge approved">

Approved

</span>

</td>

<td>

${formatDate(player.updated)}

</td>

</tr>

`;

    });

}
// ======================================
// LOAD REJECTED PLAYERS
// ======================================

async function loadRejectedPlayers(){

    const response = await fetch(

        WEB_APP_URL +

        "?action=getRejectedPlayers"

    );

    const players = await response.json();

    const table =
    document.getElementById("rejectedTable");

    table.innerHTML = "";

    if(players.length===0){

        table.innerHTML = `

        <tr>

        <td colspan="6">

        No Rejected Players

        </td>

        </tr>

        `;

        return;

    }

    players.forEach(player=>{

        table.innerHTML += `

<tr>

<td>

${player.id}

</td>

<td>

<img
src="${getDirectImageUrl(player.photo)}"
style="width:55px;height:55px;border-radius:10px;cursor:pointer"
onclick="previewImage('${getDirectImageUrl(player.photo)}')">

</td>

<td>

${player.name}

</td>

<td>

${player.position}

</td>

<td>

${player.reason || "-"}

</td>

<td>

${formatDate(player.updated)}

</td>

</tr>

`;

    });

}
// ======================================
// APPROVE PLAYER
// ======================================

async function approvePlayer(row){

    if(!confirm("Approve this player?")) return;

    showLoader();

    try{

        const response = await fetch(

            WEB_APP_URL +

            "?action=approve&row=" +

            row

        );

        const data = await response.json();

        if(data.status==="success"){

            showToast("Player Approved","success");

            await loadDashboard();

        }else{

            showToast("Approval Failed","error");

        }

    }

    catch(err){

        console.error(err);

        showToast("Approval Failed","error");

    }

    hideLoader();

}


// ======================================
// REJECT PLAYER
// ======================================

async function rejectPlayer(row){

    const reason = prompt("Reject Reason");

    if(reason===null) return;

    showLoader();

    try{

        const response = await fetch(

            WEB_APP_URL +

            "?action=reject&row=" +

            row +

            "&reason=" +

            encodeURIComponent(reason)

        );

        const data = await response.json();

        if(data.status==="success"){

            showToast("Player Rejected","success");

            await loadDashboard();

        }else{

            showToast("Reject Failed","error");

        }

    }

    catch(err){

        console.error(err);

        showToast("Reject Failed","error");

    }

    hideLoader();

}


// ======================================
// IMAGE PREVIEW
// ======================================

function previewImage(url){

    document
    .getElementById("imageModal")
    .style.display="flex";

    document
    .getElementById("previewImage")
    .src=url;

}

function closeImage(){

    document
    .getElementById("imageModal")
    .style.display="none";

}


// ======================================
// PLAYER MODAL
// ======================================

function openModal(html){

    document
    .getElementById("playerModal")
    .style.display="flex";

    document
    .getElementById("playerDetails")
    .innerHTML=html;

}

function closeModal(){

    document
    .getElementById("playerModal")
    .style.display="none";

}


// ======================================
// SEARCH
// ======================================

function initSearch(){

    const searchBox = document.getElementById("searchPlayer");

    if(!searchBox) return;

    searchBox.addEventListener("keyup", function(){

        const keyword = this.value.toLowerCase();

        const rows = document.querySelectorAll("tbody tr");

        rows.forEach(row => {

            const txt = row.innerText.toLowerCase();

            row.style.display = txt.includes(keyword) ? "" : "none";

        });

    });

}

// ======================================
// FILTERS
// ======================================

function initFilters(){

    const positionFilter = document.getElementById("positionFilter");
    const statusFilter = document.getElementById("statusFilter");

    if(positionFilter){
        positionFilter.addEventListener("change",(e)=>{
            const val = e.target.value.toLowerCase();
            const rows = document.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const txt = row.innerText.toLowerCase();
                if(val === "") {
                    row.style.display = "";
                } else {
                    row.style.display = txt.includes(val) ? "" : "none";
                }
            });
        });
    }

    if(statusFilter){
        statusFilter.addEventListener("change",(e)=>{
            const val = e.target.value;
            if (val === "Pending") document.getElementById("menuPending").click();
            else if (val === "Approved") document.getElementById("menuApproved").click();
            else if (val === "Rejected") document.getElementById("menuRejected").click();
            else document.getElementById("menuDashboard").click();
        });
    }

}
// ======================================
// AUTO REFRESH
// ======================================

setInterval(()=>{

loadDashboard();

},30000);
