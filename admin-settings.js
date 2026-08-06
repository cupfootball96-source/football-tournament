// ======================================
// SETTINGS MANAGEMENT
// ======================================

// ======================================
// LOAD SETTINGS DATA
// ======================================

async function loadAdminSettingsData() {

    try {
        const response = await fetch(WEB_APP_URL + "?action=getPublicData");
        const data = await response.json();
        
        // Update Toggle
        const toggle = document.getElementById("tournamentLiveToggle");
        const statusText = document.getElementById("tournamentLiveStatus");
        if (toggle) {
            toggle.checked = data.tournamentLive;
            statusText.textContent = data.tournamentLive ? "Live" : "Coming Soon";
            statusText.style.color = data.tournamentLive ? "var(--green)" : "var(--gold)";
        }
        
        // Update Automation Toggle
        const autoToggle = document.getElementById("automationToggle");
        const autoStatusText = document.getElementById("automationStatus");
        if (autoToggle) {
            // Default to true if undefined
            const isAutoEnabled = data.automationEnabled !== false;
            autoToggle.checked = isAutoEnabled;
            autoStatusText.textContent = isAutoEnabled ? "Enabled" : "Disabled";
            autoStatusText.style.color = isAutoEnabled ? "var(--green)" : "var(--gold)";
        }
        
        // Update Deadline Input
        const deadlineInput = document.getElementById("deadlineInput");
        if (deadlineInput && data.registrationDeadline) {
            deadlineInput.value = data.registrationDeadline;
        }
        
    } catch (err) {
        console.error(err);
        showToast("Failed to load settings", "error");
    }
}

// ======================================
// TOGGLE TOURNAMENT LIVE
// ======================================

async function toggleTournamentLive(isLive) {
    const statusText = document.getElementById("tournamentLiveStatus");
    statusText.textContent = "Saving...";
    statusText.style.color = "white";
    
    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveSetting",
                key: "isTournamentLive",
                value: isLive
            })
        });
        
        const data = await response.json();
        if (data.status === "success") {
            showToast("Tournament Status Updated", "success");
            statusText.textContent = isLive ? "Live" : "Coming Soon";
            statusText.style.color = isLive ? "var(--green)" : "var(--gold)";
        } else {
            throw new Error("API Error");
        }
    } catch (err) {
        console.error(err);
        showToast("Update Failed", "error");
        // Revert toggle
        document.getElementById("tournamentLiveToggle").checked = !isLive;
        statusText.textContent = !isLive ? "Live" : "Coming Soon";
        statusText.style.color = !isLive ? "var(--green)" : "var(--gold)";
    }
}

// ======================================
// TOGGLE AUTOMATION
// ======================================

async function toggleAutomation(isEnabled) {
    const statusText = document.getElementById("automationStatus");
    statusText.textContent = "Saving...";
    statusText.style.color = "white";
    
    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveSetting",
                key: "AutomationEnabled",
                value: isEnabled
            })
        });
        
        const data = await response.json();
        if (data.status === "success") {
            showToast("Automation Setting Updated", "success");
            statusText.textContent = isEnabled ? "Enabled" : "Disabled";
            statusText.style.color = isEnabled ? "var(--green)" : "var(--gold)";
        } else {
            throw new Error("API Error");
        }
    } catch (err) {
        console.error(err);
        showToast("Update Failed", "error");
        // Revert toggle
        document.getElementById("automationToggle").checked = !isEnabled;
        statusText.textContent = !isEnabled ? "Enabled" : "Disabled";
        statusText.style.color = !isEnabled ? "var(--green)" : "var(--gold)";
    }
}

// ======================================
// SAVE REGISTRATION DEADLINE
// ======================================

async function saveDeadline() {
    const input = document.getElementById("deadlineInput");
    if (!input || !input.value) return;
    
    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveSetting",
                key: "registrationDeadline",
                value: input.value
            })
        });
        
        const data = await response.json();
        if (data.status === "success") {
            showToast("Deadline Updated Successfully", "success");
        } else {
            throw new Error("API Error");
        }
    } catch (err) {
        console.error(err);
        showToast("Update Failed", "error");
    }
}
