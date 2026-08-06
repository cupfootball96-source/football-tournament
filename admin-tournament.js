// ======================================
// TOURNAMENT CENTER LOGIC
// ======================================
let adminTournamentData = null;
let allApprovedPlayers = [];

async function loadAdminTournamentData() {
    const teamsTbody = document.getElementById("teamsTableBody");
    const matchesTbody = document.getElementById("matchesTableBody");
    const scorersTbody = document.getElementById("scorersTableBody");
    
    let skeletonCols6 = `<tr>
        <td><div class="skeleton skeleton-avatar" style="margin:0 auto;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
    </tr>`.repeat(3);

    let skeletonCols7 = `<tr>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
    </tr>`.repeat(3);

    let skeletonCols4 = `<tr>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100%; margin:0;"></div></td>
    </tr>`.repeat(3);

    if (teamsTbody) teamsTbody.innerHTML = skeletonCols6;
    if (matchesTbody) matchesTbody.innerHTML = skeletonCols7;
    if (scorersTbody) scorersTbody.innerHTML = skeletonCols4;

    try {
        window.adminCache = window.adminCache || {};
        
        let p1 = null, p2 = null;

        if (window.adminCache.tournamentData) {
            adminTournamentData = window.adminCache.tournamentData;
        } else {
            p1 = fetchWithRetry(WEB_APP_URL + "?action=getTournamentData").then(data => {
                adminTournamentData = data;
                window.adminCache.tournamentData = adminTournamentData;
            });
        }
        
        if (window.adminCache.approvedPlayers) {
            allApprovedPlayers = window.adminCache.approvedPlayers;
        } else {
            p2 = fetchWithRetry(WEB_APP_URL + "?action=getApprovedPlayers").then(data => {
                allApprovedPlayers = data;
                window.adminCache.approvedPlayers = allApprovedPlayers;
            });
        }

        await Promise.all([p1, p2].filter(p => p !== null));

        renderTeams();
        renderMatches();
        renderTopScorers();
        initCustomSelects();
    } catch (e) {
        console.error("Failed to load tournament data", e);
    }
}

// ======================================
// GENERIC CUSTOM SELECT UTILITY
// ======================================
function initCustomSelects() {
    document.querySelectorAll('select.custom-select').forEach(setupCustomSelect);
}

function setupCustomSelect(select) {
    // Prevent double-wrapping
    if (select.dataset.customSelectInit === 'true') return;
    select.dataset.customSelectInit = 'true';
    
    select.style.display = 'none';
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.flex = select.style.flex || '1';
    wrapper.style.width = select.style.width || '100%';
    
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const contentSpan = document.createElement('span');
    contentSpan.style.display = 'flex';
    contentSpan.style.alignItems = 'center';
    contentSpan.style.gap = '8px';
    
    const selectedOpt = select.options[select.selectedIndex];
    contentSpan.innerHTML = selectedOpt ? selectedOpt.text : 'Select...';
    
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-chevron-down';
    icon.style.fontSize = '12px';
    icon.style.opacity = '0.6';
    
    trigger.appendChild(contentSpan);
    trigger.appendChild(icon);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-options';
    
    Array.from(select.children).forEach(child => {
        if (child.tagName.toLowerCase() === 'optgroup') {
            const label = document.createElement('div');
            label.className = 'custom-option-group-label';
            label.textContent = child.label;
            label.style.padding = '8px 15px';
            label.style.fontSize = '11px';
            label.style.color = 'var(--gold)';
            label.style.opacity = '0.8';
            label.style.textTransform = 'uppercase';
            label.style.letterSpacing = '1px';
            optionsContainer.appendChild(label);
            
            Array.from(child.children).forEach(opt => {
                const optDiv = document.createElement('div');
                optDiv.className = 'custom-option';
                optDiv.textContent = opt.text;
                optDiv.onclick = (e) => {
                    e.stopPropagation();
                    select.value = opt.value;
                    contentSpan.innerHTML = opt.text;
                    optionsContainer.classList.remove('show');
                    trigger.classList.remove('active');
                    select.dispatchEvent(new Event('change'));
                };
                optionsContainer.appendChild(optDiv);
            });
        } else if (child.tagName.toLowerCase() === 'option') {
            const optDiv = document.createElement('div');
            optDiv.className = 'custom-option';
            optDiv.textContent = child.text;
            if (child.value === '') optDiv.style.opacity = '0.5';
            optDiv.onclick = (e) => {
                e.stopPropagation();
                select.value = child.value;
                contentSpan.innerHTML = child.text;
                optionsContainer.classList.remove('show');
                trigger.classList.remove('active');
                select.dispatchEvent(new Event('change'));
            };
            optionsContainer.appendChild(optDiv);
        }
    });
    
    trigger.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-options').forEach(el => {
            if (el !== optionsContainer) el.classList.remove('show');
        });
        document.querySelectorAll('.custom-select-trigger').forEach(el => {
            if (el !== trigger) el.classList.remove('active');
        });
        optionsContainer.classList.toggle('show');
        trigger.classList.toggle('active');
    };
    
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);
    
    select.parentNode.insertBefore(wrapper, select.nextSibling);
    
    select.addEventListener('change', () => {
        const sel = select.options[select.selectedIndex];
        if(sel) contentSpan.innerHTML = sel.text;
    });
}

function switchTournamentTab(tabId) {
    document.querySelectorAll('.tournament-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    event.target.classList.add('active');
}

function renderTeams() {
    const tbody = document.getElementById("teamsTableBody");
    tbody.innerHTML = "";
    if(!adminTournamentData || !adminTournamentData.teams || adminTournamentData.teams.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No Teams Found</td></tr>`;
        return;
    }
    
    adminTournamentData.teams.forEach(team => {
        let playersHtml = (team.players || []).length + " Players";
        let logo = team.logoURL ? `<img src="${getDirectImageUrl(team.logoURL)}" style="width:40px;height:40px;border-radius:5px;object-fit:cover;">` : `<div style="width:40px;height:40px;background:rgba(255,255,255,0.1);border-radius:5px;display:flex;align-items:center;justify-content:center;">-</div>`;
        
        tbody.innerHTML += `
            <tr>
                <td>${logo}</td>
                <td><span style="color:var(--gold);">${team.teamID}</span></td>
                <td>${team.teamName}</td>
                <td>Group ${team.group}</td>
                <td>${playersHtml}</td>
                <td>
                    <button class="approve-btn" onclick="editTeam('${team.teamID}')">Edit</button>
                    <button class="reject-btn" onclick="deleteTeam('${team.teamID}')" style="margin-left:5px;">Delete</button>
                </td>
            </tr>
        `;
    });
}

function renderMatches() {
    const tbody = document.getElementById("matchesTableBody");
    tbody.innerHTML = "";
    if(!adminTournamentData || !adminTournamentData.matches || adminTournamentData.matches.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No Matches Found</td></tr>`;
        return;
    }
    
    const filter = document.getElementById("matchStageFilter").value;
    
    // Sort matches: group by stage conceptually, or by matchID/Date. Let's just reverse so newest is top, or keep order.
    let displayMatches = [...adminTournamentData.matches].reverse();

    displayMatches.forEach(match => {
        if(filter !== "All" && match.stage !== filter) return;
        
        let tA = adminTournamentData.teams.find(t => t.teamID === match.teamA);
        let tB = adminTournamentData.teams.find(t => t.teamID === match.teamB);
        let nameA = tA ? tA.teamName : match.teamA;
        let nameB = tB ? tB.teamName : match.teamB;
        let logoA = tA && tA.logoURL ? `<img src="${getDirectImageUrl(tA.logoURL)}" style="width:25px;height:25px;border-radius:50%;vertical-align:middle;margin-right:5px;">` : '';
        let logoB = tB && tB.logoURL ? `<img src="${getDirectImageUrl(tB.logoURL)}" style="width:25px;height:25px;border-radius:50%;vertical-align:middle;margin-left:5px;">` : '';
        
        let scoreHtml = match.status === "Completed" ? `<strong style="font-size:18px;">${match.scoreA} - ${match.scoreB}</strong>` : `<em style="opacity:0.6;">vs</em>`;
        let statusBadge = match.status === "Completed" ? `<span class="badge approved">Completed</span>` : `<span class="badge pending">Scheduled</span>`;

        tbody.innerHTML += `
            <tr>
                <td><span style="color:var(--gold);">${match.matchID}</span></td>
                <td>${match.stage}</td>
                <td style="text-align:right;">${nameA} ${logoA}</td>
                <td style="text-align:center;">${scoreHtml}</td>
                <td style="text-align:left;">${logoB} ${nameB}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="approve-btn" onclick="editMatch('${match.matchID}')">Edit</button>
                    <button class="reject-btn" onclick="deleteMatch('${match.matchID}')" style="margin-left:5px;">Delete</button>
                </td>
            </tr>
        `;
    });
}

function renderTopScorers() {
    const tbody = document.getElementById("scorersTableBody");
    tbody.innerHTML = "";
    if(!adminTournamentData || !adminTournamentData.topScorers || adminTournamentData.topScorers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No Scorers Found</td></tr>`;
        return;
    }
    
    adminTournamentData.topScorers.forEach((scorer, index) => {
        let team = adminTournamentData.teams.find(t => t.teamID === scorer.team);
        let teamName = team ? team.teamName : scorer.team;
        let playerPhotoUrl = scorer.photo ? getDirectImageUrl(scorer.photo) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        let playerPhotoImg = `<img src="${playerPhotoUrl}" style="width:30px;height:30px;border-radius:50%;vertical-align:middle;margin-right:10px;object-fit:cover;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">`;
        
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${playerPhotoImg} <strong>${scorer.name}</strong></td>
                <td><span style="color:#aaa;">${teamName}</span></td>
                <td style="color:var(--gold); font-weight:bold; font-size: 18px;">${scorer.goals}</td>
            </tr>
        `;
    });
}

function filterMatches() {
    renderMatches();
}

// TEAM MODAL LOGIC
function openAddTeamModal() {
    document.getElementById("teamIdInput").value = "";
    document.getElementById("teamNameInput").value = "";
    document.getElementById("teamGroupInput").value = "";
    document.getElementById("teamLogoInput").value = "";
    
    document.getElementById("ownerNameInput").value = "";
    document.getElementById("businessNameInput").value = "";
    document.getElementById("instagramInput").value = "";
    document.getElementById("websiteInput").value = "";
    document.getElementById("whatsappInput").value = "";
    
    const container = document.getElementById("playerSelectionContainer");
    container.innerHTML = "";
    allApprovedPlayers.forEach(p => {
        if (isPlayerAssignedToAnotherTeam(p.id)) return;
        
        container.innerHTML += `
            <label style="display:flex; align-items:center; gap:10px; padding:8px; background:rgba(0,0,0,0.3); border-radius:3px; cursor:pointer;">
                <input type="checkbox" name="teamPlayers" value="${p.id}" data-name="${p.name}" onchange="handlePlayerCheckboxChange()"> 
                <img src="${getDirectImageUrl(p.photo)}" style="width:25px;height:25px;border-radius:50%;">
                ${p.name} <span style="color:var(--gold);font-size:12px;">(${p.position})</span>
            </label>
        `;
    });

    document.getElementById("teamModal").style.display = "flex";
    handlePlayerCheckboxChange();
}

function editTeam(teamID) {
    const team = adminTournamentData.teams.find(t => t.teamID === teamID);
    if (!team) return;
    
    document.getElementById("teamIdInput").value = team.teamID;
    document.getElementById("teamNameInput").value = team.teamName;
    document.getElementById("teamGroupInput").value = team.group;
    document.getElementById("teamLogoInput").value = ""; 
    
    document.getElementById("ownerNameInput").value = (team.owner && team.owner.ownerName) || "";
    document.getElementById("businessNameInput").value = (team.owner && team.owner.businessName) || "";
    document.getElementById("instagramInput").value = (team.owner && team.owner.instagram) || "";
    document.getElementById("websiteInput").value = (team.owner && team.owner.website) || "";
    document.getElementById("whatsappInput").value = (team.owner && team.owner.whatsapp) || "";
    
    const container = document.getElementById("playerSelectionContainer");
    container.innerHTML = "";
    allApprovedPlayers.forEach(p => {
        if (isPlayerAssignedToAnotherTeam(p.id, team.teamID)) return;
        
        const isSelected = team.players && team.players.some(tp => tp.id === p.id);
        const checkedStr = isSelected ? "checked" : "";
        container.innerHTML += `
            <label style="display:flex; align-items:center; gap:10px; padding:8px; background:rgba(0,0,0,0.3); border-radius:3px; cursor:pointer;">
                <input type="checkbox" name="teamPlayers" value="${p.id}" data-name="${p.name}" ${checkedStr} onchange="handlePlayerCheckboxChange()"> 
                <img src="${getDirectImageUrl(p.photo)}" style="width:25px;height:25px;border-radius:50%;">
                ${p.name} <span style="color:var(--gold);font-size:12px;">(${p.position})</span>
            </label>
        `;
    });

    document.getElementById("teamModal").style.display = "flex";
    handlePlayerCheckboxChange();
}

function handlePlayerCheckboxChange() {
    const checkboxes = document.querySelectorAll('input[name="teamPlayers"]');
    const checkedCount = document.querySelectorAll('input[name="teamPlayers"]:checked').length;
    
    if (checkedCount >= 4) {
        checkboxes.forEach(cb => {
            if (!cb.checked) cb.disabled = true;
        });
    } else {
        checkboxes.forEach(cb => {
            cb.disabled = false;
        });
    }
}

function isPlayerAssignedToAnotherTeam(playerId, currentTeamId = null) {
    if (!adminTournamentData || !adminTournamentData.teams) return false;
    for (const team of adminTournamentData.teams) {
        if (currentTeamId && team.teamID === currentTeamId) continue;
        if (team.players && team.players.some(p => p.id === playerId)) {
            return true;
        }
    }
    return false;
}

function closeTeamModal() {
    document.getElementById("teamModal").style.display = "none";
}

document.getElementById("teamForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = this.querySelector("button[type='submit']");
    const originalText = btn.innerHTML;
    btn.innerHTML = "Processing...";
    btn.disabled = true;

    try {
        const logoFile = document.getElementById("teamLogoInput").files[0];
        const teamId = document.getElementById("teamIdInput").value;
        if (!logoFile && !teamId) {
            showToast("Please select a logo for the new team.", "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }
        let base64Logo = "";
        if (logoFile) {
            base64Logo = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(logoFile);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
        
        const selectedCheckboxes = document.querySelectorAll('input[name="teamPlayers"]:checked');
        if (selectedCheckboxes.length > 4) {
            showToast("A team can have a maximum of 4 players.", "error");
            hideLoader();
            return;
        }

        let players = [];
        selectedCheckboxes.forEach(cb => {
            players.push({ id: cb.value, name: cb.getAttribute("data-name") });
        });

        const data = {
            action: "saveTeam",
            teamID: document.getElementById("teamIdInput").value,
            teamName: document.getElementById("teamNameInput").value,
            group: document.getElementById("teamGroupInput").value,
            ownerName: document.getElementById("ownerNameInput").value,
            businessName: document.getElementById("businessNameInput").value,
            instagram: document.getElementById("instagramInput").value,
            website: document.getElementById("websiteInput").value,
            whatsapp: document.getElementById("whatsappInput").value,
            logo: base64Logo,
            players: players
        };
        
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });
        
        const res = await response.json();
        if(res.status === "success") {
            showToast("Team Saved!", "success");
            closeTeamModal();
            if (window.adminCache) window.adminCache.tournamentData = null;
            loadAdminTournamentData();
        } else {
            showToast("Failed to save team", "error");
        }
    } catch(err) {
        console.error(err);
        showToast("Error saving team", "error");
    }
    btn.innerHTML = originalText;
    btn.disabled = false;
});

async function deleteMatch(matchId) {
    const confirmed = await showConfirm(
        "Delete Match",
        "Are you sure you want to delete this match? This cannot be undone."
    );
    if (!confirmed) return;
    
    showLoader();
    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "deleteMatch", matchID: matchId })
        });
        const res = await response.json();
        
        if (res.status === "success") {
            showToast("Match Deleted", "success");
            // Clear ALL caches - both browser and admin cache - so nothing stale is shown
            Object.keys(sessionStorage).forEach(k => { if (k.startsWith('nec_')) sessionStorage.removeItem(k); });
            window.adminCache = {};
            loadAdminTournamentData();
        } else {
            showToast("Failed to delete match", "error");
        }
    } catch(err) {
        console.error(err);
        showToast("Error deleting match", "error");
    }
    hideLoader();
}

async function deleteTeam(teamId) {
    const confirmed = await showConfirm(
        "Delete Team",
        "Are you sure you want to delete this team? This will remove all assigned players and related match data."
    );
    if (!confirmed) return;
    
    showLoader();
    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "deleteTeam", teamID: teamId })
        });
        const res = await response.json();
        
        if (res.status === "success") {
            showToast("Team Deleted", "success");
            // Clear ALL caches - both browser and admin cache - so nothing stale is shown
            Object.keys(sessionStorage).forEach(k => { if (k.startsWith('nec_')) sessionStorage.removeItem(k); });
            window.adminCache = {};
            loadAdminTournamentData();
        } else {
            showToast("Failed to delete team", "error");
        }
    } catch(err) {
        console.error(err);
        showToast("Error deleting team", "error");
    }
    hideLoader();
}

function updateScorerOptions() {
    // Optionally wipe scorers if teams change, or just let users handle it.
}

// MATCH MODAL LOGIC
function openAddMatchModal() {
    document.getElementById("matchIdInput").value = "";
    document.getElementById("scoreAInput").value = "0";
    document.getElementById("scoreBInput").value = "0";
    document.getElementById("scorersContainer").innerHTML = "";
    document.getElementById("matchStatusInput").value = "Scheduled";
    
    populateTeamSelects();
    document.getElementById("matchModal").style.display = "flex";
    toggleMatchStatusFields();
}

function editMatch(matchId) {
    const match = adminTournamentData.matches.find(m => m.matchID === matchId);
    if(!match) return;
    
    document.getElementById("matchIdInput").value = match.matchID;
    document.getElementById("matchStageInput").value = match.stage;
    document.getElementById("matchStatusInput").value = match.status;
    
    populateTeamSelects();
    document.getElementById("teamASelect").value = match.teamA;
    document.getElementById("teamBSelect").value = match.teamB;
    setCustomDropdownVisuals('teamASelect', 'teamASelectedContent');
    setCustomDropdownVisuals('teamBSelect', 'teamBSelectedContent');
    renderCustomDropdown('teamADropdown', 'teamASelect', 'teamASelectedContent', 'teamBSelect');
    renderCustomDropdown('teamBDropdown', 'teamBSelect', 'teamBSelectedContent', 'teamASelect');
    
    document.getElementById("scoreAInput").value = match.scoreA;
    document.getElementById("scoreBInput").value = match.scoreB;
    
    const container = document.getElementById("scorersContainer");
    container.innerHTML = "";
    if(match.scorers && match.scorers.length > 0) {
        match.scorers.forEach(scorer => {
            addScorerRow(scorer);
        });
    }
    
    document.getElementById("matchModal").style.display = "flex";
    toggleMatchStatusFields();
}

function closeMatchModal() {
    document.getElementById("matchModal").style.display = "none";
}

function toggleMatchStatusFields() {
    const status = document.getElementById("matchStatusInput").value;
    const goalsA = document.getElementById("goalsContainerA");
    const goalsDivider = document.getElementById("goalsDivider");
    const goalsB = document.getElementById("goalsContainerB");
    const scorersSection = document.getElementById("scorersSection");
    
    if (status === "Scheduled") {
        goalsA.style.display = "none";
        goalsDivider.style.display = "none";
        goalsB.style.display = "none";
        scorersSection.style.display = "none";
        document.getElementById("scoreAInput").value = "0";
        document.getElementById("scoreBInput").value = "0";
        document.getElementById("scorersContainer").innerHTML = "";
    } else {
        goalsA.style.display = "block";
        goalsDivider.style.display = "block";
        goalsB.style.display = "block";
        scorersSection.style.display = "block";
    }
}

function populateTeamSelects() {
    let teamsOptions = [];
    if (adminTournamentData && adminTournamentData.teams) {
        adminTournamentData.teams.forEach(t => {
            if (t.players && t.players.length === 4) {
                teamsOptions.push({
                    id: t.teamID,
                    name: t.teamName,
                    group: t.group,
                    logo: t.logoURL ? getDirectImageUrl(t.logoURL) : 'assets/logo.png'
                });
            }
        });
    }
    window.customTeamsOptions = teamsOptions;
    
    document.getElementById("teamASelectedContent").innerHTML = "Select Team...";
    document.getElementById("teamBSelectedContent").innerHTML = "Select Team...";
    
    renderCustomDropdown('teamADropdown', 'teamASelect', 'teamASelectedContent', 'teamBSelect');
    renderCustomDropdown('teamBDropdown', 'teamBSelect', 'teamBSelectedContent', 'teamASelect');
}

function renderCustomDropdown(dropdownId, hiddenInputId, contentSpanId, otherHiddenInputId) {
    const dropdown = document.getElementById(dropdownId);
    const otherInput = document.getElementById(otherHiddenInputId);
    if(!dropdown) return;
    
    let html = '';
    window.customTeamsOptions.forEach(t => {
        let disabledClass = (otherInput && otherInput.value === t.id) ? 'disabled' : '';
        // Escape quotes to be safe
        let nameEscaped = t.name.replace(/'/g, "\'");
        html += `
            <div class="custom-option ${disabledClass}" onclick="selectCustomTeam('${t.id}', '${nameEscaped}', '${t.logo}', '${dropdownId}', '${hiddenInputId}', '${contentSpanId}', '${otherHiddenInputId}')">
                <img src="${t.logo}" onerror="this.src='assets/logo.png'">
                <div class="custom-option-name">${t.name}</div>
                <div class="custom-option-group">Grp ${t.group}</div>
            </div>
        `;
    });
    dropdown.innerHTML = html;
}

function toggleCustomDropdown(dropdownId) {
    document.querySelectorAll('.custom-options').forEach(el => {
        if (el.id !== dropdownId) el.classList.remove('show');
    });
    document.getElementById(dropdownId).classList.toggle('show');
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-select-trigger') && !e.target.closest('.custom-options')) {
        document.querySelectorAll('.custom-options').forEach(el => el.classList.remove('show'));
    }
});

function selectCustomTeam(teamId, teamName, teamLogo, dropdownId, hiddenInputId, contentSpanId, otherHiddenInputId) {
    document.getElementById(hiddenInputId).value = teamId;
    document.getElementById(contentSpanId).innerHTML = `
        <img src="${teamLogo}" style="width:20px;height:20px;border-radius:4px;object-fit:cover;" onerror="this.src='assets/logo.png'">
        ${teamName}
    `;
    document.getElementById(dropdownId).classList.remove('show');
    
    renderCustomDropdown('teamADropdown', 'teamASelect', 'teamASelectedContent', 'teamBSelect');
    renderCustomDropdown('teamBDropdown', 'teamBSelect', 'teamBSelectedContent', 'teamASelect');
    
    updateScorerOptions();
}

function setCustomDropdownVisuals(hiddenInputId, contentSpanId) {
    const val = document.getElementById(hiddenInputId).value;
    if (val && window.customTeamsOptions) {
        const team = window.customTeamsOptions.find(t => t.id === val);
        if (team) {
            document.getElementById(contentSpanId).innerHTML = `
                <img src="${team.logo}" style="width:20px;height:20px;border-radius:4px;object-fit:cover;" onerror="this.src='assets/logo.png'">
                ${team.name}
            `;
        }
    } else {
        document.getElementById(contentSpanId).innerHTML = "Select Team...";
    }
}


function updateScorerOptions() {
    // Optionally wipe scorers if teams change, or just let users handle it.
}

function addScorerRow(existingData = null) {
    const container = document.getElementById("scorersContainer");
    const teamAId = document.getElementById("teamASelect").value;
    const teamBId = document.getElementById("teamBSelect").value;
    
    if(!teamAId || !teamBId) {
        showToast("Please select Team A and Team B first.", "warning");
        return;
    }
    
    const teamA = adminTournamentData.teams.find(t => t.teamID === teamAId);
    const teamB = adminTournamentData.teams.find(t => t.teamID === teamBId);
    
    const select = document.createElement("select");
    select.className = "scorer-select custom-select";
    select.style.flex = "1";
    
    let playersOptions = `<option value="">Select Player...</option>`;
    
    if(teamA && teamA.players) {
        playersOptions += `<optgroup label="${teamA.teamName}">`;
        teamA.players.forEach(p => {
            playersOptions += `<option value='${JSON.stringify({id: p.id, name: p.name, teamId: teamA.teamID})}'>${p.name}</option>`;
        });
        playersOptions += `</optgroup>`;
    }
    if(teamB && teamB.players) {
        playersOptions += `<optgroup label="${teamB.teamName}">`;
        teamB.players.forEach(p => {
            playersOptions += `<option value='${JSON.stringify({id: p.id, name: p.name, teamId: teamB.teamID})}'>${p.name}</option>`;
        });
        playersOptions += `</optgroup>`;
    }
    select.innerHTML = playersOptions;
    
    const div = document.createElement("div");
    div.className = "scorer-row";
    div.style.cssText = "display:flex; gap:10px; align-items:center; background:rgba(0,0,0,0.3); padding:8px; border-radius:5px;";
    
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.value = existingData ? existingData.goals : "1";
    input.style.width = "60px";
    input.style.padding = "8px";
    input.style.borderRadius = "5px";
    input.style.background = "rgba(0,0,0,0.5)";
    input.style.color = "white";
    input.style.border = "1px solid rgba(255,255,255,0.2)";
    input.style.textAlign = "center";
    input.className = "scorer-goals";
    
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.style.background = "var(--red)";
    delBtn.style.color = "white";
    delBtn.style.border = "none";
    delBtn.style.padding = "8px 12px";
    delBtn.style.borderRadius = "5px";
    delBtn.style.cursor = "pointer";
    delBtn.onclick = () => div.remove();
    
    div.appendChild(select);
    div.appendChild(input);
    div.appendChild(delBtn);
    
    container.appendChild(div);
    
    // Apply custom select styling
    setupCustomSelect(select);
    
    if(existingData) {
        for(let i=0; i<select.options.length; i++) {
            if(select.options[i].value && select.options[i].value.includes(existingData.playerID)) {
                select.selectedIndex = i;
                select.dispatchEvent(new Event('change'));
                break;
            }
        }
    }
}

document.getElementById("matchForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = this.querySelector("button[type='submit']");
    const originalText = btn.innerHTML;
    btn.innerHTML = "Processing...";
    btn.disabled = true;

    try {
        const teamAId = document.getElementById("teamASelect").value;
        const teamBId = document.getElementById("teamBSelect").value;
        
        if (teamAId === teamBId) {
            showToast("Team A and Team B cannot be the same", "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const scoreA = parseInt(document.getElementById("scoreAInput").value) || 0;
        const scoreB = parseInt(document.getElementById("scoreBInput").value) || 0;
        
        let sumA = 0;
        let sumB = 0;

        let scorers = [];
        document.querySelectorAll(".scorer-row").forEach(row => {
            const selectVal = row.querySelector(".scorer-select").value;
            const goals = row.querySelector(".scorer-goals").value;
            if(selectVal && goals > 0) {
                const playerData = JSON.parse(selectVal);
                const g = parseInt(goals);
                if (playerData.teamId === teamAId) sumA += g;
                if (playerData.teamId === teamBId) sumB += g;
                
                scorers.push({
                    playerID: playerData.id,
                    playerName: playerData.name,
                    teamID: playerData.teamId,
                    goals: g
                });
            }
        });
        
        if (sumA > scoreA) {
            showToast(`Team A scorers have ${sumA} goals, but team score is ${scoreA}`, "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }
        if (sumB > scoreB) {
            showToast(`Team B scorers have ${sumB} goals, but team score is ${scoreB}`, "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }
        
        const data = {
            action: "saveMatch",
            matchID: document.getElementById("matchIdInput").value,
            stage: document.getElementById("matchStageInput").value,
            status: document.getElementById("matchStatusInput").value,
            teamA: teamAId,
            teamB: teamBId,
            scoreA: document.getElementById("scoreAInput").value,
            scoreB: document.getElementById("scoreBInput").value,
            scorers: scorers
        };
        
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });
        
        const res = await response.json();
        if(res.status === "success") {
            showToast("Match Saved!", "success");
            closeMatchModal();
            if (window.adminCache) window.adminCache.tournamentData = null;
            loadAdminTournamentData();
        } else {
            showToast("Failed to save match", "error");
        }
    } catch(err) {
        console.error(err);
        showToast("Error saving match", "error");
    }
    btn.innerHTML = originalText;
    btn.disabled = false;
});
