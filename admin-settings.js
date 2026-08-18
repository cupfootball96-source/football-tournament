// ======================================
// SETTINGS MANAGEMENT
// ======================================

// ======================================
// LOAD SETTINGS DATA
// ======================================

async function loadAdminSettingsData() {

    try {
        window.adminCache = window.adminCache || {};
        if (window.adminCache.settings) {
            var data = window.adminCache.settings;
        } else {
            var data = await fetchWithRetry(WEB_APP_URL + "?action=getPublicData");
            window.adminCache.settings = data;
        }
        
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

        // Update Live Match Toggle
        const liveToggle = document.getElementById("liveMatchToggle");
        const liveStatus = document.getElementById("liveMatchStatus");
        if (liveToggle) {
            const isLive = data.liveMatchActive === true || data.liveMatchActive === "true";
            liveToggle.checked = isLive;
            liveStatus.textContent = isLive ? "🔴 LIVE" : "Offline";
            liveStatus.style.color = isLive ? "#ff4444" : "var(--gold)";
        }

        // Update Live Match URL
        const liveUrlInput = document.getElementById("liveMatchUrlInput");
        if (liveUrlInput && data.liveMatchUrl) {
            liveUrlInput.value = data.liveMatchUrl;
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
            if (window.adminCache) window.adminCache.settings = null;
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
            if (window.adminCache) window.adminCache.settings = null;
            showToast("Automation Status Updated", "success");
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

// ======================================
// TOGGLE LIVE MATCH
// ======================================

async function toggleLiveMatch(isLive) {
    const statusText = document.getElementById("liveMatchStatus");
    statusText.textContent = "Saving...";
    statusText.style.color = "white";

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveSetting",
                key: "liveMatchActive",
                value: isLive
            })
        });

        const data = await response.json();
        if (data.status === "success") {
            if (window.adminCache) window.adminCache.settings = null;
            showToast(isLive ? "🔴 Match is now LIVE!" : "Match marked Offline", isLive ? "success" : "success");
            statusText.textContent = isLive ? "🔴 LIVE" : "Offline";
            statusText.style.color = isLive ? "#ff4444" : "var(--gold)";
        } else {
            throw new Error("API Error");
        }
    } catch (err) {
        console.error(err);
        showToast("Update Failed", "error");
        document.getElementById("liveMatchToggle").checked = !isLive;
        statusText.textContent = !isLive ? "🔴 LIVE" : "Offline";
        statusText.style.color = !isLive ? "#ff4444" : "var(--gold)";
    }
}

// ======================================
// SAVE LIVE MATCH URL
// ======================================

async function saveLiveMatchUrl() {
    const input = document.getElementById("liveMatchUrlInput");
    if (!input || !input.value.trim()) {
        showToast("Please enter a YouTube URL first", "error");
        return;
    }

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveSetting",
                key: "liveMatchUrl",
                value: input.value.trim()
            })
        });

        const data = await response.json();
        if (data.status === "success") {
            if (window.adminCache) window.adminCache.settings = null;
            showToast("Live Stream URL Saved!", "success");
        } else {
            throw new Error("API Error");
        }
    } catch (err) {
        console.error(err);
        showToast("Failed to save URL", "error");
    }
}

