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

    // Mobile Menu logic
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('show');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }
    
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.addEventListener('click', () => {
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('show');
            }
        });
    });


});


// ======================================
// LOAD DASHBOARD
// ======================================

window.adminCache = window.adminCache || {};

async function forceRefreshDashboard() {
    window.adminCache = {};
    if (typeof loadAdminTournamentData === "function") window.adminCache.tournamentData = null;
    await loadDashboard();
}

async function loadDashboard(){

    // showLoader();

    try{

    await loadStats();
    await loadPendingPlayers();
    await loadApprovedPlayers();
    await loadRejectedPlayers();

}

catch(err){

    console.error(err);

    showToast(

        "Dashboard Load Failed",

        "error"

    );

}

finally{

    // hideLoader();

}
}


// ======================================
// LOAD STATS
// ======================================

async function loadStats(){
    const statIds = ["pending", "approved", "rejected", "remaining"];
    statIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="skeleton skeleton-text" style="margin:0 auto; width:40px; height:30px;"></div>';
    });

    if (window.adminCache.stats) {
        var data = window.adminCache.stats;
    } else {
        const response = await fetch(WEB_APP_URL + "?action=getStats");
        var data = await response.json();
        window.adminCache.stats = data;
    }

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
// Loader definitions removed


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
    const table = document.getElementById("playerTable");
    if (table) {
        let skeletonRows = '';
        for(let i=0; i<5; i++){
            skeletonRows += `<tr>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-avatar" style="width:40px; height:40px; border-radius:10px; margin:0 auto;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
            </tr>`;
        }
        table.innerHTML = skeletonRows;
    }

    if (window.adminCache.pendingPlayers) {
        var players = window.adminCache.pendingPlayers;
    } else {
        const response = await fetch(WEB_APP_URL + "?action=getPlayers");
        var players = await response.json();
        window.adminCache.pendingPlayers = players;
    }

    table.innerHTML = "";

    if(players.length===0){

        table.innerHTML = `
        <tr>
            <td colspan="11">No Pending Players</td>
        </tr>
        `;

        return;

    }

    window.allPlayersData = window.allPlayersData || {};

    players.forEach(player=>{

        window.allPlayersData[player.id] = player;

        table.innerHTML += `

<tr>

<td>
<span style="color:var(--gold); cursor:pointer;" onclick="showPlayerCard('${player.id}')">${player.id}</span>
</td>

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
class="approve-btn"
onclick="previewImage('${getDirectImageUrl(player.payment)}')">

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
onclick="approvePlayer(this, ${player.row})">

Approve

</button>

<button
class="reject-btn"
onclick="rejectPlayer(this, ${player.row})">

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
            return "https://lh3.googleusercontent.com/d/" + id + "=w600?authuser=0";
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
    const table = document.getElementById("approvedTable");
    const recentFeedEl = document.getElementById("recentApprovalsFeed");
    const statIds = ["positionStats", "experienceStats", "ageStats"];

    if (table) {
        let skeletonRows = '';
        for(let i=0; i<5; i++){
            skeletonRows += `<tr>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-avatar" style="width:40px; height:40px; border-radius:10px; margin:0 auto;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
            </tr>`;
        }
        table.innerHTML = skeletonRows;
    }
    
    if (recentFeedEl) {
        let skeletonFeed = '';
        for(let i=0; i<3; i++) {
            skeletonFeed += `<div style="display:flex; align-items:center; gap:15px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div class="skeleton skeleton-avatar" style="width:45px; height:45px; border-radius:50%;"></div>
                <div style="flex:1;">
                    <div class="skeleton skeleton-text" style="width:60%; margin-bottom:5px;"></div>
                    <div class="skeleton skeleton-text" style="width:40%; height:10px;"></div>
                </div>
            </div>`;
        }
        recentFeedEl.innerHTML = skeletonFeed;
    }

    statIds.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.innerHTML = '<li><div class="skeleton skeleton-text" style="width:80%; margin:0;"></div></li><li><div class="skeleton skeleton-text" style="width:60%; margin:0;"></div></li>';
    });

    if (window.adminCache.approvedPlayers) {
        var players = window.adminCache.approvedPlayers;
    } else {
        const response = await fetch(WEB_APP_URL + "?action=getApprovedPlayers");
        var players = await response.json();
        window.adminCache.approvedPlayers = players;
    }

    // Calculate Stats
    let posCounts = { "Goalkeeper": 0, "Defender": 0, "Midfielder": 0, "Forward": 0 };
    let expCounts = {};
    let ageCounts = { "Under 18": 0, "18-22": 0, "23-28": 0, "29+": 0 };
    
    players.forEach(p => {
        let pos = p.position || "Unknown";
        if (posCounts[pos] !== undefined) posCounts[pos]++;
        else posCounts[pos] = 1;
        
        let exp = p.experience || "N/A";
        expCounts[exp] = (expCounts[exp] || 0) + 1;

        let age = parseInt(p.age);
        if (!isNaN(age)) {
            if (age < 18) ageCounts["Under 18"]++;
            else if (age <= 22) ageCounts["18-22"]++;
            else if (age <= 28) ageCounts["23-28"]++;
            else ageCounts["29+"]++;
        }
    });

    const posStatsEl = document.getElementById("positionStats");
    if (posStatsEl) posStatsEl.innerHTML = Object.entries(posCounts).map(([k, v]) => `<li>${k}: <span style="color:var(--gold); font-weight:bold;">${v}</span></li>`).join('');

    const expStatsEl = document.getElementById("experienceStats");
    if (expStatsEl) expStatsEl.innerHTML = Object.entries(expCounts).map(([k, v]) => `<li>${k}: <span style="color:var(--gold); font-weight:bold;">${v}</span></li>`).join('');

    const ageStatsEl = document.getElementById("ageStats");
    if (ageStatsEl) ageStatsEl.innerHTML = Object.entries(ageCounts).map(([k, v]) => `<li>${k}: <span style="color:var(--gold); font-weight:bold;">${v}</span></li>`).join('');

    // Recent Approvals
    if (recentFeedEl) {
        if (players.length === 0) {
            recentFeedEl.innerHTML = '<div style="color:white; text-align:center;">No recent approvals.</div>';
        } else {
            let recentPlayers = players.slice(-5).reverse(); // Get the last 5 players
            recentFeedEl.innerHTML = recentPlayers.map(p => `
                <div style="display:flex; align-items:center; gap:15px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <img src="${getDirectImageUrl(p.photo)}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--gold);">
                    <div style="flex:1;">
                        <h5 style="margin:0; font-size:15px; color:white; font-weight:600;">${p.name}</h5>
                        <p style="margin:4px 0 0 0; font-size:12px; color:rgba(255,255,255,0.6);"><span style="color:var(--gold);">${p.id}</span> • ${p.position}</p>
                    </div>
                    <div style="font-size:12px; color:var(--green); font-weight:600; background:rgba(0,200,83,0.15); padding:6px 12px; border-radius:20px;">
                        <i class="fa-solid fa-check"></i> Approved
                    </div>
                </div>
            `).join('');
        }
    }

    if (!table) return;
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

    window.allPlayersData = window.allPlayersData || {};

    players.forEach(player=>{

        window.allPlayersData[player.id] = player;

        table.innerHTML += `

<tr>

<td>

<span style="color:var(--gold); cursor:pointer;" onclick="showPlayerCard('${player.id}')">${player.id}</span>

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
    const table = document.getElementById("rejectedTable");
    if (table) {
        let skeletonRows = '';
        for(let i=0; i<5; i++){
            skeletonRows += `<tr>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-avatar" style="width:40px; height:40px; border-radius:10px; margin:0 auto;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
                <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
            </tr>`;
        }
        table.innerHTML = skeletonRows;
    }

    if (window.adminCache.rejectedPlayers) {
        var players = window.adminCache.rejectedPlayers;
    } else {
        const response = await fetch(WEB_APP_URL + "?action=getRejectedPlayers");
        var players = await response.json();
        window.adminCache.rejectedPlayers = players;
    }

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

    window.allPlayersData = window.allPlayersData || {};

    players.forEach(player=>{

        window.allPlayersData[player.id] = player;

        table.innerHTML += `

<tr>

<td>

<span style="color:var(--gold); cursor:pointer;" onclick="showPlayerCard('${player.id}')">${player.id}</span>

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

async function approvePlayer(btn, row){

    if(!confirm("Approve this player?")) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = "Processing...";
    btn.disabled = true;

    try{

        const response = await fetch(

            WEB_APP_URL +

            "?action=approve&row=" +

            row

        );

        const data = await response.json();

        if(data.status==="success"){

            showToast("Player Approved","success");

            await forceRefreshDashboard();

    // Mobile Menu logic
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('show');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }
    
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.addEventListener('click', () => {
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('show');
            }
        });
    });


        }else{

            showToast("Approval Failed","error");

        }

    }

    catch(err){

        console.error(err);

        showToast("Approval Failed","error");

    }

    btn.innerHTML = originalText;
    btn.disabled = false;

}


// ======================================
// REJECT PLAYER
// ======================================

async function rejectPlayer(btn, row){

    const reason = prompt("Reject Reason");

    if(reason===null) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = "Processing...";
    btn.disabled = true;

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

            await forceRefreshDashboard();

    // Mobile Menu logic
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('show');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }
    
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.addEventListener('click', () => {
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('show');
            }
        });
    });


        }else{

            showToast("Reject Failed","error");

        }

    }

    catch(err){

        console.error(err);

        showToast("Reject Failed","error");

    }

    btn.innerHTML = originalText;
    btn.disabled = false;

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

function showPlayerCard(playerId) {
    const player = window.allPlayersData[playerId];
    if(!player) return;

    let statusColor = "var(--gold)"; 
    let statusText = "Pending";
    let bgOpacity = "rgba(255, 193, 7, 0.1)";
    
    if (player.status === "Approved") {
        statusColor = "var(--green)";
        statusText = "Approved";
        bgOpacity = "rgba(0, 200, 83, 0.1)";
    } else if (player.status === "Rejected") {
        statusColor = "var(--red)";
        statusText = "Rejected";
        bgOpacity = "rgba(229, 57, 53, 0.1)";
    }

    const photoUrl = getDirectImageUrl(player.photo);

    const html = `
        <div style="background:var(--primary); border: 2px solid ${statusColor}; border-radius:15px; padding:25px; text-align:center; position:relative; overflow:hidden; box-shadow: 0 0 20px ${bgOpacity};">
            <div style="position:absolute; top:15px; right:15px; background:${statusColor}; color:${player.status==='Pending'?'#071B3B':'white'}; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:700;">${statusText}</div>
            
            <img src="${photoUrl}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid ${statusColor}; margin-bottom:15px; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
            
            <h2 style="margin:0; font-size:24px; color:white;">${player.name}</h2>
            <div style="color:var(--gold); font-weight:700; font-size:14px; margin-top:5px; letter-spacing:1px;">ID: ${player.id}</div>
            
            <h4 style="margin:10px 0 20px; color:rgba(255,255,255,0.7); font-size:16px;">${player.position}</h4>
            
            <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
                <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; min-width:80px; flex:1;">
                    <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Age</div>
                    <div style="font-size:16px; font-weight:600;">${player.age || 'N/A'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; min-width:80px; flex:1;">
                    <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Foot</div>
                    <div style="font-size:16px; font-weight:600;">${player.foot || 'N/A'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; min-width:80px; flex:1;">
                    <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Exp</div>
                    <div style="font-size:16px; font-weight:600;">${player.experience || 'N/A'}</div>
                </div>
            </div>
            
            <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; margin-top:15px;">
                <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Mobile</div>
                <div style="font-size:16px; font-weight:600; color:var(--white);">${player.mobile || 'N/A'}</div>
            </div>
            
            ${player.status === 'Rejected' && player.rejectReason ? `<div style="margin-top:20px; padding:15px; background:rgba(229, 57, 53, 0.1); border-left:4px solid var(--red); color:#ffcdcc; text-align:left; font-size:13px; border-radius:4px;"><strong>Reject Reason:</strong> ${player.rejectReason}</div>` : ''}
        </div>
    `;

    openModal(html);
}

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

function showPlayerCard(playerId) {
    const player = window.allPlayersData[playerId];
    if(!player) return;

    let statusColor = "var(--gold)"; 
    let statusText = "Pending";
    let bgOpacity = "rgba(255, 193, 7, 0.1)";
    
    if (player.status === "Approved") {
        statusColor = "var(--green)";
        statusText = "Approved";
        bgOpacity = "rgba(0, 200, 83, 0.1)";
    } else if (player.status === "Rejected") {
        statusColor = "var(--red)";
        statusText = "Rejected";
        bgOpacity = "rgba(229, 57, 53, 0.1)";
    }

    const photoUrl = getDirectImageUrl(player.photo);

    const html = `
        <div style="background:var(--primary); border: 2px solid ${statusColor}; border-radius:15px; padding:25px; text-align:center; position:relative; overflow:hidden; box-shadow: 0 0 20px ${bgOpacity};">
            <div style="position:absolute; top:15px; right:15px; background:${statusColor}; color:${player.status==='Pending'?'#071B3B':'white'}; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:700;">${statusText}</div>
            
            <img src="${photoUrl}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid ${statusColor}; margin-bottom:15px; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
            
            <h2 style="margin:0; font-size:24px; color:white;">${player.name}</h2>
            <div style="color:var(--gold); font-weight:700; font-size:14px; margin-top:5px; letter-spacing:1px;">ID: ${player.id}</div>
            
            <h4 style="margin:10px 0 20px; color:rgba(255,255,255,0.7); font-size:16px;">${player.position}</h4>
            
            <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
                <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; min-width:80px; flex:1;">
                    <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Age</div>
                    <div style="font-size:16px; font-weight:600;">${player.age || 'N/A'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; min-width:80px; flex:1;">
                    <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Foot</div>
                    <div style="font-size:16px; font-weight:600;">${player.foot || 'N/A'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; min-width:80px; flex:1;">
                    <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Exp</div>
                    <div style="font-size:16px; font-weight:600;">${player.experience || 'N/A'}</div>
                </div>
            </div>
            
            <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; margin-top:15px;">
                <div style="font-size:11px; opacity:0.6; text-transform:uppercase;">Mobile</div>
                <div style="font-size:16px; font-weight:600; color:var(--white);">${player.mobile || 'N/A'}</div>
            </div>
            
            ${player.status === 'Rejected' && player.rejectReason ? `<div style="margin-top:20px; padding:15px; background:rgba(229, 57, 53, 0.1); border-left:4px solid var(--red); color:#ffcdcc; text-align:left; font-size:13px; border-radius:4px;"><strong>Reject Reason:</strong> ${player.rejectReason}</div>` : ''}
        </div>
    `;

    openModal(html);
}

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
// Auto-refresh removed per user request

// ======================================
// CLOSE MODALS ON OUTSIDE CLICK
// ======================================

window.addEventListener("click", function(event) {
    const playerModal = document.getElementById("playerModal");
    const imageModal = document.getElementById("imageModal");
    const teamModal = document.getElementById("teamModal");
    const matchModal = document.getElementById("matchModal");
    
    if (event.target === playerModal) {
        playerModal.style.display = "none";
    }
    if (event.target === imageModal) {
        imageModal.style.display = "none";
    }
    if (event.target === teamModal) teamModal.style.display = "none";
    if (event.target === matchModal) matchModal.style.display = "none";
});

// Tournament Center logic has been moved to admin-tournament.js
