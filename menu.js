// =================================
// NGC ADMIN MENU CONTROL
// =================================


document.addEventListener("DOMContentLoaded", function(){


const dashboardBtn = document.getElementById("menuDashboard");
const pendingBtn = document.getElementById("menuPending");
const approvedBtn = document.getElementById("menuApproved");
const rejectedBtn = document.getElementById("menuRejected");
const tournamentBtn = document.getElementById("menuTournament");
const settingsBtn = document.getElementById("menuSettings");
const logoutBtn = document.getElementById("logoutBtn");



const dashboardSection = document.getElementById("dashboardSection");
const pendingSection = document.getElementById("pendingSection");
const approvedSection = document.getElementById("approvedSection");
const rejectedSection = document.getElementById("rejectedSection");
const tournamentSection = document.getElementById("tournamentSection");
const settingsSection = document.getElementById("settingsSection");

const summarySection = document.getElementById("summarySection");
const toolbar = document.querySelector(".toolbar");

// SHOW ONLY SELECTED SECTION

function hideAll(){

    pendingSection.style.display="none";
    approvedSection.style.display="none";
    rejectedSection.style.display="none";
    if (tournamentSection) tournamentSection.style.display="none";
    if (settingsSection) settingsSection.style.display="none";
    if (summarySection) summarySection.style.display="none";
    if (toolbar) toolbar.style.display="none";

}



// ACTIVE MENU

function activeMenu(btn){

    document.querySelectorAll(".sidebar li")
    .forEach(item=>{
        item.classList.remove("active");
    });


    btn.classList.add("active");

}



// DASHBOARD

dashboardBtn.onclick=function(){

    hideAll();

    if (summarySection) summarySection.style.display="block";

    activeMenu(dashboardBtn);

    // Reset status filter to All Status when clicking dashboard
    const statusFilter = document.getElementById("statusFilter");
    if(statusFilter) statusFilter.value = "";

};



// PENDING

pendingBtn.onclick=function(){

    hideAll();

    pendingSection.style.display="block";
    if (toolbar) toolbar.style.display="flex";

    activeMenu(pendingBtn);

    loadPendingPlayers();

};



// APPROVED

approvedBtn.onclick=function(){

    hideAll();

    approvedSection.style.display="block";
    if (toolbar) toolbar.style.display="flex";

    activeMenu(approvedBtn);

    loadApprovedPlayers();

};



// REJECTED

rejectedBtn.onclick=function(){

    hideAll();

    rejectedSection.style.display="block";
    if (toolbar) toolbar.style.display="flex";

    activeMenu(rejectedBtn);

    loadRejectedPlayers();

};


// TOURNAMENT

if (tournamentBtn) {
    tournamentBtn.onclick=function(){
        hideAll();
        if (tournamentSection) tournamentSection.style.display="block";
        if (toolbar) toolbar.style.display="none"; // No toolbar for tournament center for now
        activeMenu(tournamentBtn);
        
        // Load tournament data if the function exists
        if (typeof loadAdminTournamentData === "function") {
            loadAdminTournamentData();
        }
    };
}


// SETTINGS

settingsBtn.onclick=function(){
    hideAll();
    if (settingsSection) settingsSection.style.display="block";
    if (toolbar) toolbar.style.display="none";
    activeMenu(settingsBtn);
    
    if (typeof loadAdminSettingsData === "function") {
        loadAdminSettingsData();
    }
};



// LOGOUT

logoutBtn.onclick=function(){


    let confirmLogout =
    confirm("Are you sure you want to logout?");


    if(confirmLogout){

        window.location.href="admin.html";

    }


};

    // INITIALIZE DEFAULT VIEW
    dashboardBtn.onclick();


});