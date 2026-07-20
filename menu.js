// =================================
// NGC ADMIN MENU CONTROL
// =================================


document.addEventListener("DOMContentLoaded", function(){


const dashboardBtn = document.getElementById("menuDashboard");
const pendingBtn = document.getElementById("menuPending");
const approvedBtn = document.getElementById("menuApproved");
const rejectedBtn = document.getElementById("menuRejected");
const settingsBtn = document.getElementById("menuSettings");
const logoutBtn = document.getElementById("logoutBtn");



const dashboardSection = document.getElementById("dashboardSection");
const pendingSection = document.getElementById("pendingSection");
const approvedSection = document.getElementById("approvedSection");
const rejectedSection = document.getElementById("rejectedSection");



const summarySection = document.getElementById("summarySection");

// SHOW ONLY SELECTED SECTION

function hideAll(){

    pendingSection.style.display="none";
    approvedSection.style.display="none";
    rejectedSection.style.display="none";
    if (summarySection) summarySection.style.display="none";

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

    pendingSection.style.display="block";
    approvedSection.style.display="block";
    rejectedSection.style.display="block";
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

    activeMenu(pendingBtn);

    loadPendingPlayers();

};



// APPROVED

approvedBtn.onclick=function(){

    hideAll();

    approvedSection.style.display="block";

    activeMenu(approvedBtn);

    loadApprovedPlayers();

};



// REJECTED

rejectedBtn.onclick=function(){

    hideAll();

    rejectedSection.style.display="block";

    activeMenu(rejectedBtn);

    loadRejectedPlayers();

};


// SETTINGS

settingsBtn.onclick=function(){

    alert("Settings Coming Soon");

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