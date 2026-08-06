
function renderOverview(data) {
    const container = document.getElementById('tab-overview');
    if (!container) return;

    let totalMatches = 0;
    let totalGoals = 0;
    if (data.matches) {
        totalMatches = data.matches.filter(m => m.status === 'Completed').length;
        data.matches.forEach(m => {
            if (m.status === 'Completed') {
                totalGoals += (Number(m.scoreA) || 0) + (Number(m.scoreB) || 0);
            }
        });
    }

    // Top Scorer
    let topScorerHtml = '<div style="color:#aaa; font-size:14px;">No data yet.</div>';
    if (data.topScorers && data.topScorers.length > 0) {
        const ts = data.topScorers[0];
        const photo = ts.photo ? getDirectImageUrl(ts.photo) : 'assets/logo.png';
        
        let teamName = ts.team;
        if (data.teams) {
            const foundTeam = data.teams.find(t => t.teamID === ts.team);
            if (foundTeam) teamName = foundTeam.teamName;
        }

        topScorerHtml = `
            <div class="overview-top-scorer">
                <img src="${photo}" alt="Top Scorer" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
                <div class="ts-info">
                    <h4>${ts.name}</h4>
                    <p>${teamName}</p>
                </div>
                <div class="ts-goals">
                    <strong>${ts.goals}</strong> Goals
                </div>
            </div>
        `;
    }

    // Recent Matches (up to 4)
    let recentMatchesHtml = '<div style="color:#aaa; font-size:14px;">No matches yet.</div>';
    if (data.matches && data.matches.length > 0) {
        const completed = data.matches.filter(m => m.status === 'Completed').reverse().slice(0, 4);
        if (completed.length > 0) {
            recentMatchesHtml = '<div class="overview-recent-matches">';
            completed.forEach(m => {
                let tAName = m.teamA, tBName = m.teamB;
                let tALogo = 'assets/logo.png', tBLogo = 'assets/logo.png';
                if (data.teams) {
                    const fA = data.teams.find(t => t.teamID === m.teamA);
                    if (fA) {
                        tAName = fA.teamName;
                        if (fA.logoURL) tALogo = getDirectImageUrl(fA.logoURL);
                    }
                    const fB = data.teams.find(t => t.teamID === m.teamB);
                    if (fB) {
                        tBName = fB.teamName;
                        if (fB.logoURL) tBLogo = getDirectImageUrl(fB.logoURL);
                    }
                }
                const matchId = `match-${m.teamA}-${m.teamB}-${m.stage.replace(/\\s+/g, '-')}`;
                recentMatchesHtml += `
                    <div class="overview-match-row" onclick="document.querySelector('[data-tab=\\'tab-matches\\']').click(); setTimeout(() => { const el = document.getElementById('${matchId}'); if(el) el.scrollIntoView({behavior: 'smooth', block: 'center'}); }, 100);" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" title="Click to view full match details">
                        <div class="ov-team" style="display:flex; align-items:center; gap:8px; justify-content:flex-start;"><img src="${tALogo}" style="width:20px;height:20px;object-fit:contain;" onerror="this.src='assets/logo.png'"> <span>${tAName}</span></div>
                        <div class="ov-score" style="margin: 0 10px;">${m.scoreA} - ${m.scoreB}</div>
                        <div class="ov-team text-right" style="display:flex; align-items:center; gap:8px; justify-content:flex-end;"><span>${tBName}</span> <img src="${tBLogo}" style="width:20px;height:20px;object-fit:contain;" onerror="this.src='assets/logo.png'"></div>
                    </div>
                `;
            });
            recentMatchesHtml += '</div>';
        }
    }

    container.innerHTML = `
        <section class="overview-section" style="padding: 40px 0;">
            <div class="container">
                <div class="overview-grid">
                    
                    <div class="overview-card">
                        <h3 class="overview-card-title"><i class="fa-solid fa-chart-pie"></i> Tournament Stats</h3>
                        <div class="stats-row">
                            <div class="stat-box">
                                <div class="stat-value">${totalMatches}</div>
                                <div class="stat-label">Matches Played</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-value">${totalGoals}</div>
                                <div class="stat-label">Total Goals</div>
                            </div>
                        </div>
                    </div>

                    <div class="overview-card">
                        <h3 class="overview-card-title"><i class="fa-solid fa-shoe-prints"></i> Current Golden Boot</h3>
                        ${topScorerHtml}
                    </div>

                    <div class="overview-card">
                        <h3 class="overview-card-title"><i class="fa-solid fa-clock-rotate-left"></i> Recent Results</h3>
                        ${recentMatchesHtml}
                    </div>

                </div>
            </div>
        </section>
    `;
}


function getDirectImageUrl(url) {
    if (!url) return 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Fallback
    if (url.includes('drive.google.com/file/d/')) {
        const id = url.split('/d/')[1].split('/')[0];
        return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    if (url.includes('drive.google.com/open?id=')) {
        const id = url.split('id=')[1];
        return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return url;
}

// tournament.js

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz42gF4EyG0u82ZUZB6ECxLRMLzLeOce1lSFK6fYM5l-ZUnai-8IwDf0mqRqTL0NT5gDA/exec";

// The backend will provide the tournament data.

// Tie-breaker logic: 1. Points -> 2. Goal Difference -> 3. Goals For -> 4. Alphabetical
function sortGroup(teams) {
    // First, calculate Points and GD dynamically to ensure accuracy
    teams.forEach(team => {
        team.pts = (team.w * 3) + (team.d * 1);
        team.gd = team.gf - team.ga;
    });

    return teams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts; // Highest points first
        if (b.gd !== a.gd) return b.gd - a.gd;     // Higher Goal Difference first
        if (b.gf !== a.gf) return b.gf - a.gf;     // Higher Goals Scored first
        return a.name.localeCompare(b.name);       // Alphabetical fallback
    });
}

function renderGroups(groupsData) {
    if (!groupsData || Object.keys(groupsData).length === 0) {
        // Fallback to empty standings if no data
        groupsData = {
            A: Array.from({length: 4}, (_, i) => ({ name: `Team A${i+1}`, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 })),
            B: Array.from({length: 4}, (_, i) => ({ name: `Team B${i+1}`, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 })),
            C: Array.from({length: 4}, (_, i) => ({ name: `Team C${i+1}`, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 })),
            D: Array.from({length: 4}, (_, i) => ({ name: `Team D${i+1}`, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))
        };
    }

    const groupContainers = {
        A: document.getElementById('groupA-body'),
        B: document.getElementById('groupB-body'),
        C: document.getElementById('groupC-body'),
        D: document.getElementById('groupD-body')
    };

    for (const groupName in groupContainers) {
        const tbody = groupContainers[groupName];
        if (!tbody) continue;

        let teams = groupsData[groupName] || [];
        teams = sortGroup(teams); // Apply sorting logic

        tbody.innerHTML = ''; // Clear existing rows

        teams.forEach((team, index) => {
            const rowClass = index < 2 ? 'advancing' : '';
            const gdDisplay = team.gd > 0 ? `+${team.gd}` : team.gd;
            const logo = team.logo ? getDirectImageUrl(team.logo) : 'assets/logo.png';

            tbody.innerHTML += `
                <tr class="${rowClass}">
                    <td style="display:flex; align-items:center; gap:10px;">
                        <span style="color:#888; font-size:12px; min-width:15px;">${index + 1}.</span>
                        <img src="${logo}" class="table-team-logo" onerror="this.src='assets/logo.png'">
                        <span class="table-team-name">${team.name}</span>
                    </td>
                    <td>${team.p}</td>
                    <td>${team.w}</td>
                    <td>${team.d}</td>
                    <td>${team.l}</td>
                    <td>${team.gf}</td>
                    <td>${team.ga}</td>
                    <td><span class="badge badge-gd">${gdDisplay}</span></td>
                    <td><span class="badge badge-pts">${team.pts}</span></td>
                </tr>
            `;
        });
    }
}

function renderTopScorers(scorers, teams = []) {
    const container = document.getElementById('scorersContainer');
    if (!container) return;

    container.innerHTML = ''; // Clear loading text

    if (!scorers || scorers.length === 0) {
        container.innerHTML = `
            <div class="coming-soon-card">
                <div class="icon">⏳</div>
                <h3>Coming Soon</h3>
                <p>The Golden Boot race will begin after the first match.</p>
            </div>
        `;
        return;
    }

    // Sort by goals descending
    scorers.sort((a, b) => b.goals - a.goals);

    scorers.forEach((player, index) => {
        let teamName = player.team;
        if (teams && teams.length > 0) {
            const foundTeam = teams.find(t => t.teamID === player.team);
            if (foundTeam) teamName = foundTeam.teamName;
        }
        
        const playerPhoto = player.photo ? getDirectImageUrl(player.photo) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Assuming you have a default avatar
        container.innerHTML += `
            <div class="scorer-card">
                <div class="scorer-rank">#${index + 1}</div>
                <img src="${playerPhoto}" alt="Player Photo" class="scorer-player-photo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
                <div class="scorer-info">
                    <div class="scorer-name">${player.name}</div>
                    <div class="scorer-team">${teamName}</div>
                </div>
                <div class="scorer-goals">
                    <span class="goal-count">${player.goals}</span>
                    <span class="goal-label"><i class="fa-solid fa-futbol" style="margin-right:5px; color:var(--gold);"></i>Goals</span>
                </div>
            </div>
        `;
    });
}


function renderMatches(matches, teams) {
    const container = document.getElementById('matchResultsContainer');
    if (!container) return;

    if (!matches || matches.length === 0) {
        container.innerHTML = '<div style="color:white;text-align:center;grid-column:1/-1;">No matches played yet.</div>';
        return;
    }

    container.innerHTML = '';
    
    // Reverse matches so newest are at the top (since they are appended in Sheets)
    const displayMatches = [...matches].reverse();

    displayMatches.forEach(m => {
        let tA = { name: m.teamA, logo: 'assets/logo.png' };
        let tB = { name: m.teamB, logo: 'assets/logo.png' };
        
        if (teams) {
            const foundA = teams.find(t => t.teamID === m.teamA);
            if (foundA) {
                tA.name = foundA.teamName;
                if (foundA.logoURL) tA.logo = foundA.logoURL;
            }
            const foundB = teams.find(t => t.teamID === m.teamB);
            if (foundB) {
                tB.name = foundB.teamName;
                if (foundB.logoURL) tB.logo = foundB.logoURL;
            }
        }
        
        let statusClass = m.status === 'Completed' ? 'status-completed' : 'status-scheduled';
        let outcomeBadgeText = m.status;
        
        let crownA = '';
        let crownB = '';
        let classA = '';
        let classB = '';
        
        if (m.status === 'Completed') {
            const sA = Number(m.scoreA) || 0;
            const sB = Number(m.scoreB) || 0;
            
            if (sA > sB) {
                outcomeBadgeText = `${tA.name} Won`;
                statusClass = 'status-won';
                crownA = '<i class="fa-solid fa-crown" style="color:var(--gold); margin-right:8px; font-size:14px;"></i>';
                classA = 'winner-name';
                classB = 'loser-opacity';
            } else if (sB > sA) {
                outcomeBadgeText = `${tB.name} Won`;
                statusClass = 'status-won';
                crownB = '<i class="fa-solid fa-crown" style="color:var(--gold); margin-left:8px; font-size:14px;"></i>';
                classB = 'winner-name';
                classA = 'loser-opacity';
            } else {
                outcomeBadgeText = 'Draw';
                statusClass = 'status-draw';
            }
        }

        // Parse scorers
        let scorersA = [];
        let scorersB = [];
        if (m.scorers && m.scorers.length > 0) {
            m.scorers.forEach(s => {
                if (s.teamID === m.teamA) scorersA.push(`${s.playerName.split(' ')[0]} (${s.goals})`);
                if (s.teamID === m.teamB) scorersB.push(`${s.playerName.split(' ')[0]} (${s.goals})`);
            });
        }
        
        
        let scorersHtmlA = '';
        let scorersHtmlB = '';
        if (scorersA.length > 0) scorersHtmlA = scorersA.join('<br>');
        if (scorersB.length > 0) scorersHtmlB = scorersB.join('<br>');

        const matchId = `match-${m.teamA}-${m.teamB}-${m.stage.replace(/\\s+/g, '-')}`;
        let displayStage = m.stage.toLowerCase().includes('group') ? `${m.stage} Match` : `${m.stage} Stage`;
        if (m.stage.toLowerCase() === 'final' || m.stage.toLowerCase().includes('third')) displayStage = m.stage;

        let matchType = m.status === 'Completed' ? 'result' : 'upcoming';

        container.innerHTML += `
            <div class="match-card" id="${matchId}" data-match-type="${matchType}">
                <div class="match-stage">${displayStage}</div>
                <div class="match-teams" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    
                    <!-- TEAM A SIDE (Far Left) -->
                    <div style="display:flex; align-items:center; gap:10px; flex:1; justify-content:flex-start;" class="${classA}">
                        <img src="${tA.logo}" alt="Team A Logo" class="match-team-logo" onerror="this.src='assets/logo.png'">
                        <div class="match-team-name">${crownA}${tA.name}</div>
                        <div class="match-scorers-inline" style="color:#aaa; font-size:11px; margin-left:10px; line-height:1.4; text-align:left;">
                            ${scorersHtmlA}
                        </div>
                    </div>
                    
                    <!-- SCORE (Center) -->
                    <div class="match-score" style="margin: 0 15px;">${m.scoreA} - ${m.scoreB}</div>
                    
                    <!-- TEAM B SIDE (Far Right) -->
                    <div style="display:flex; align-items:center; gap:10px; flex:1; justify-content:flex-end;" class="${classB}">
                        <div class="match-scorers-inline" style="color:#aaa; font-size:11px; margin-right:10px; line-height:1.4; text-align:right;">
                            ${scorersHtmlB}
                        </div>
                        <div class="match-team-name">${tB.name}${crownB}</div>
                        <img src="${tB.logo}" alt="Team B Logo" class="match-team-logo" onerror="this.src='assets/logo.png'">
                    </div>
                    
                </div>
                <div class="match-status ${statusClass}">${outcomeBadgeText}</div>
            </div>
        `;

    });
}

function renderKnockoutBracket(matches, teams) {
    if (!matches) return;

    // Helper to populate a bracket match given the match object and its DOM ID
    const populateMatch = (domId, matchId) => {
        const match = matches.find(m => m.matchID === matchId);
        const container = document.getElementById(domId);
        if (!container) return;

        const titleElem = container.querySelector('.match-title');
        const teamA_Name = container.querySelector('.team-a-name');
        const teamA_Score = container.querySelector('.team-a-score');
        const teamB_Name = container.querySelector('.team-b-name');
        const teamB_Score = container.querySelector('.team-b-score');

        if (match) {
            let tAName = match.teamA;
            let tBName = match.teamB;
            if (teams) {
                const fA = teams.find(t => t.teamID === match.teamA);
                if (fA) tAName = fA.teamName;
                const fB = teams.find(t => t.teamID === match.teamB);
                if (fB) tBName = fB.teamName;
            }

            // Keep the default labels (like "Winner Grp A") if not populated yet
            if (!tAName.startsWith('Winner') && !tAName.startsWith('Runner-Up') && match.teamA !== "") teamA_Name.textContent = tAName;
            if (!tBName.startsWith('Winner') && !tBName.startsWith('Runner-Up') && match.teamB !== "") teamB_Name.textContent = tBName;
            
            // For Quarter/Semi, if a team hasn't progressed yet, its teamA might just be an empty string or standard text, handled above.

            // Only show scores if completed
            if (match.status === 'Completed') {
                teamA_Score.textContent = match.scoreA;
                teamB_Score.textContent = match.scoreB;
                
                // Highlight winner
                if (parseInt(match.scoreA) > parseInt(match.scoreB)) {
                    teamA_Name.style.color = "var(--gold)";
                    teamA_Name.style.fontWeight = "bold";
                } else if (parseInt(match.scoreB) > parseInt(match.scoreA)) {
                    teamB_Name.style.color = "var(--gold)";
                    teamB_Name.style.fontWeight = "bold";
                }
            } else {
                teamA_Score.textContent = '-';
                teamB_Score.textContent = '-';
            }
        }
    };

    // Assuming match IDs match what the backend uses:
    populateMatch('bracket-MATCH-QF1', 'M-QF-1');
    populateMatch('bracket-MATCH-QF2', 'M-QF-2');
    populateMatch('bracket-MATCH-QF3', 'M-QF-3');
    populateMatch('bracket-MATCH-QF4', 'M-QF-4');
    
    populateMatch('bracket-MATCH-SF1', 'M-SF-1');
    populateMatch('bracket-MATCH-SF2', 'M-SF-2');
    
    populateMatch('bracket-MATCH-F1', 'M-F-1');
}

function showSkeletons() {
    const matchContainer = document.getElementById('matchResultsContainer');
    if (matchContainer) {
        matchContainer.innerHTML = Array(4).fill(`
            <div class="skeleton-card">
                <div class="skeleton skeleton-title" style="margin:0 auto; width:100px;"></div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; gap:10px; align-items:center;"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-text" style="width:80px; margin:0;"></div></div>
                    <div class="skeleton skeleton-title" style="margin:0; width:60px;"></div>
                    <div style="display:flex; gap:10px; align-items:center;"><div class="skeleton skeleton-text" style="width:80px; margin:0;"></div><div class="skeleton skeleton-avatar"></div></div>
                </div>
            </div>
        `).join('');
    }

    const scorerContainer = document.getElementById('scorersContainer');
    if (scorerContainer) {
        scorerContainer.innerHTML = Array(3).fill(`
            <div class="skeleton-card" style="flex-direction:row; align-items:center; gap:20px;">
                <div class="skeleton skeleton-text" style="width:30px; height:20px; margin:0;"></div>
                <div class="skeleton skeleton-avatar"></div>
                <div style="flex:1;">
                    <div class="skeleton skeleton-title" style="margin:0 0 5px 0;"></div>
                    <div class="skeleton skeleton-text" style="width:50%; margin:0;"></div>
                </div>
                <div class="skeleton skeleton-title" style="margin:0; width:40px;"></div>
            </div>
        `).join('');
    }

    const overviewContainer = document.getElementById('tab-overview');
    if (overviewContainer && !overviewContainer.querySelector('.overview-grid')) {
        overviewContainer.innerHTML = `
            <section class="overview-section" style="padding: 40px 0;">
                <div class="container">
                    <div class="overview-grid">
                        <div class="skeleton-card" style="height:200px; justify-content:center; align-items:center;">
                            <div class="skeleton skeleton-title" style="width:60%; margin-bottom:20px;"></div>
                            <div style="display:flex; gap:30px; width:100%; justify-content:center;">
                                <div class="skeleton skeleton-text" style="width:40px; height:40px; border-radius:50%;"></div>
                                <div class="skeleton skeleton-text" style="width:40px; height:40px; border-radius:50%;"></div>
                            </div>
                        </div>
                        <div class="skeleton-card" style="height:200px; justify-content:center; align-items:center;">
                            <div class="skeleton skeleton-title" style="width:60%; margin-bottom:20px;"></div>
                            <div class="skeleton skeleton-avatar" style="width:60px; height:60px; margin-bottom:10px;"></div>
                            <div class="skeleton skeleton-text" style="width:40%;"></div>
                        </div>
                        <div class="skeleton-card" style="height:200px; justify-content:center;">
                            <div class="skeleton skeleton-title" style="width:50%; margin-bottom:20px;"></div>
                            <div class="skeleton skeleton-text" style="width:100%;"></div>
                            <div class="skeleton skeleton-text" style="width:100%;"></div>
                            <div class="skeleton skeleton-text" style="width:100%;"></div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    ['A', 'B', 'C', 'D'].forEach(g => {
        const tb = document.getElementById(`group${g}-body`);
        if (tb) {
            tb.innerHTML = Array(4).fill(`
                <tr>
                    <td><div style="display:flex; gap:10px; align-items:center;"><div class="skeleton skeleton-avatar" style="width:25px;height:25px;"></div> <div class="skeleton skeleton-text" style="width:100px; margin:0;"></div></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:15px;"></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:15px;"></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:15px;"></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:15px;"></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:15px;"></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:15px;"></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:20px;"></div></td>
                    <td><div class="skeleton skeleton-text" style="margin:0 auto; width:20px;"></div></td>
                </tr>
            `).join('');
        }
    });
}
async function fetchWithCache(url, cacheKey, ttl = 5 * 60 * 1000) {
    const cachedInfo = sessionStorage.getItem(cacheKey);
    if (cachedInfo) {
        const parsed = JSON.parse(cachedInfo);
        if (Date.now() - parsed.timestamp < ttl) {
            return parsed.data;
        }
    }

    let retries = 3;
    while (retries > 0) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");
            
            const text = await response.text();
            
            if (text.includes("<!DOCTYPE") || text.includes("<html")) {
                throw new Error("Received HTML instead of JSON. Rate limit or server error.");
            }
            
            const data = JSON.parse(text);

            sessionStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));

            return data;
        } catch (error) {
            retries--;
            console.warn(`Fetch failed for ${cacheKey}. Retries left: ${retries}`, error);
            if (retries === 0) {
                console.error("All retries failed for", cacheKey);
                return null;
            }
            await new Promise(res => setTimeout(res, (3 - retries) * 1000));
        }
    }
}

async function checkLiveBanner() {
    try {
        const settings = await fetchWithCache(WEB_APP_URL + "?action=getPublicData", "nec_public_data");
        const liveBanner = document.getElementById('globalLiveBanner');
        if (liveBanner && settings && (settings.liveMatchActive === true || settings.liveMatchActive === "true")) {
            liveBanner.style.display = 'flex';
            // Always link to live.html — it handles embedding the YouTube video
            liveBanner.href = 'live.html';
        } else if (liveBanner) {
            liveBanner.style.display = 'none';
        }
    } catch (e) {
        console.warn("Could not check live banner status", e);
    }
}

async function loadTournamentData() {
    try {
        showSkeletons();
        // Fetch Settings (re-use same cached call)
        const settings = await fetchWithCache(WEB_APP_URL + "?action=getPublicData", "nec_public_data");

        // Live Banner Logic — runs BEFORE the early return so it always shows
        const liveBanner = document.getElementById('globalLiveBanner');
        if (liveBanner && settings && (settings.liveMatchActive === true || settings.liveMatchActive === "true")) {
            liveBanner.style.display = 'flex';
            // Always link to live.html — it handles embedding the YouTube video
            liveBanner.href = 'live.html';
        }

        if (settings && settings.tournamentLive !== true) {
            document.getElementById("comingSoonOverlay").style.display = "flex";
            document.body.style.overflow = "hidden"; // Prevent scrolling
            return; // Stop loading data
        }

        // Fetch tournament data
        const data = await fetchWithCache(WEB_APP_URL + "?action=getTournamentData", "nec_tournament_data");
        
        if (data) {
            renderOverview(data);
        }

        if (data && data.groups) {
            renderGroups(data.groups);
        } else {
            console.error("No group data received.");
            renderGroups(null);
        }


        if (data && data.matches) {
            renderMatches(data.matches, data.teams);
            renderKnockoutBracket(data.matches, data.teams);
        } else {
            renderMatches([], []);
        }

        if (data && data.topScorers) {
            renderTopScorers(data.topScorers, data.teams);
        } else {
            renderTopScorers([]);
        }
    } catch (error) {
        console.error("Failed to load live tournament data.", error);
        renderTopScorers([]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded'); // Fix vertical scrolling
    loadTournamentData();
    setupTabs();
    initTeamPage();
    loadAllVerifiedPlayers();
});

// Setup Tabs Logic
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function activateTab(targetId) {
        const btn = document.querySelector(`.tab-btn[data-tab="${targetId}"]`);
        const pane = document.getElementById(targetId);
        
        if (btn && pane) {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active to targeted
            btn.classList.add('active');
            pane.classList.add('active');
            window.history.replaceState(null, null, `#${targetId}`);
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            activateTab(targetId);
        });
    });

    // Match Filter Buttons
    const matchFilterBtns = document.querySelectorAll('.match-filter-btn');
    const matchContainer = document.getElementById('matchResultsContainer');
    
    if (matchFilterBtns.length > 0 && matchContainer) {
        matchFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                matchFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                matchContainer.setAttribute('data-active-filter', filter);
            });
        });
    }

    // Check hash on load
    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        activateTab(currentHash);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
});

// ==========================================
// TEAMS AND PLAYERS TAB LOGIC
// ==========================================

function getTeamLogoUrl(url) {
    if (!url) return "";
    if (url.includes("/d/")) {
        const idMatch = url.match(/\/d\/([^\/]+)/);
        if (idMatch && idMatch[1]) {
            return "https://lh3.googleusercontent.com/d/" + idMatch[1] + "=w600?authuser=0";
        }
    }
    if (url.includes("id=")) {
        const idMatch = url.match(/id=([^&]+)/);
        if (idMatch && idMatch[1]) {
            return "https://lh3.googleusercontent.com/d/" + idMatch[1] + "=w600?authuser=0";
        }
    }
    return url;
}

let globalPlayers = [];

async function initTeamPage() {
    const grid = document.getElementById("teamGrid");
    if (!grid) return;
    
    try {
        const teams = await fetchWithCache(WEB_APP_URL + "?action=getTeams", "nec_teams");
        fetchWithCache(WEB_APP_URL + "?action=getApprovedPlayers", "nec_approved_players").then(res => {
            globalPlayers = res || [];
        }).catch(e => console.error(e));
        renderTeamsFull(teams, grid);
    } catch (e) {
        console.error("Failed to load teams for dedicated page", e);
        grid.innerHTML = "<div style=\"color:red;text-align:center;grid-column:1/-1;padding:20px;\">Failed to load teams. Please try again later.</div>";
    }
}

function renderTeamsFull(teams, grid) {
    let displayTeams = teams || [];
    const numPlaceholders = Math.max(0, 16 - displayTeams.length);
    let html = "";

    displayTeams.forEach((team, i) => {
        const logoUrl = getTeamLogoUrl(team.logoURL);
        const logoHtml = logoUrl 
            ? `<img src="${logoUrl}" alt="${team.teamName} Logo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
            : `<i class="fa-solid fa-shield-halved"></i>`;
        
        let ownerName = (team.owner && team.owner.ownerName) ? team.owner.ownerName : "TBA";
        let businessName = (team.owner && team.owner.businessName) ? team.owner.businessName : "TBA";
        let frontOwnerStatus = (ownerName !== "TBA") ? `Owner: ${ownerName}` : "Owner: Coming Soon";

        html += `
            <div class="team-card" data-team-index="${i}">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="team-logo-placeholder" style="width:120px;height:120px;border-radius:50%;overflow:hidden;border:2px solid var(--gold);display:flex;justify-content:center;align-items:center;background:#222;margin-bottom:15px;box-shadow:0 0 15px rgba(212,175,55,0.3);">
                            ${logoHtml}
                        </div>
                        <h3>${team.teamName}</h3>
                        <span class="owner-status" style="font-size:14px;color:#aaa;">${frontOwnerStatus}</span>
                        <div style="margin-top:10px; font-size:12px; color:var(--gold); font-weight:bold;"><i class="fa-solid fa-arrow-pointer"></i> Click to View</div>
                    </div>
                    <div class="card-back" style="background:linear-gradient(135deg, #111 0%, #1a1a2e 100%);">
                        <h3>${team.teamName}</h3>
                        <div class="coming-soon-details">
                            <div class="detail-row">
                                <i class="fa-solid fa-user-tie" style="color:var(--gold);margin-right:10px;"></i>
                                <span>Owner: ${ownerName}</span>
                            </div>
                            <div class="detail-row" style="margin-top:10px;">
                                <i class="fa-solid fa-briefcase" style="color:var(--gold);margin-right:10px;"></i>
                                <span>${businessName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    for (let i = 0; i < numPlaceholders; i++) {
        const index = displayTeams.length + i + 1;
        html += `
            <div class="team-card placeholder" data-team-placeholder="${index}">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="team-logo-placeholder" style="width:120px;height:120px;border-radius:50%;overflow:hidden;border:2px solid var(--gold);display:flex;justify-content:center;align-items:center;background:#222;margin-bottom:15px;font-size:40px;color:var(--gold);">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <h3>Team ${index}</h3>
                        <span class="owner-status" style="font-size:14px;color:#aaa;">Owner: Coming Soon</span>
                    </div>
                    <div class="card-back" style="background:linear-gradient(135deg, #111 0%, #1a1a2e 100%);">
                        <h3>Team ${index}</h3>
                        <div class="coming-soon-details">
                            <div class="detail-row">
                                <i class="fa-solid fa-user-tie" style="color:var(--gold);margin-right:10px;"></i>
                                <span>Owner: TBA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    grid.innerHTML = html;

    let modalOverlay = document.querySelector(".team-modal-overlay");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.className = "team-modal-overlay";
        modalOverlay.innerHTML = `
            <div class="team-modal-close" onclick="closeTeamModal()"><i class="fa-solid fa-xmark"></i></div>
            <div class="team-modal-content">
                <div class="team-flip-card" id="teamModalFlipCard">
                    <div class="team-card-face team-card-front">
                        <img src="assets/logo.png" style="width:150px; opacity:0.5;" alt="NEC Logo">
                    </div>
                    <div class="team-card-face team-card-back" id="teamModalBack">
                        <!-- Dynamic content -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    }

    const cards = grid.querySelectorAll(".team-card:not(.placeholder)");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const tIndex = card.getAttribute("data-team-index");
            if (tIndex !== null) {
                openTeamModal(displayTeams[tIndex]);
            }
        });
    });
}

function openTeamModal(team) {
    const modalBack = document.getElementById("teamModalBack");
    const overlay = document.querySelector(".team-modal-overlay");
    
    if (!modalBack || !overlay) return;

    const logoUrl = getTeamLogoUrl(team.logoURL);
    const logoHtml = logoUrl 
        ? `<img src="${logoUrl}" alt="${team.teamName} Logo">`
        : `<div style="width:180px;height:180px;border-radius:50%;border:4px solid var(--gold);display:flex;justify-content:center;align-items:center;font-size:60px;margin-bottom:25px;background:#333;"><i class="fa-solid fa-shield-halved"></i></div>`;
        
    let ownerName = (team.owner && team.owner.ownerName) ? team.owner.ownerName : "TBA";
    let businessName = (team.owner && team.owner.businessName) ? team.owner.businessName : "TBA";
    
    let socialsHtml = "";
    if (team.owner && team.owner.instagram) socialsHtml += `<a href="${team.owner.instagram}" target="_blank" style="color:var(--gold);margin:0 10px;font-size:28px;transition:0.3s;"><i class="fa-brands fa-instagram"></i></a>`;
    if (team.owner && team.owner.whatsapp) socialsHtml += `<a href="${team.owner.whatsapp}" target="_blank" style="color:var(--gold);margin:0 10px;font-size:28px;transition:0.3s;"><i class="fa-brands fa-whatsapp"></i></a>`;
    if (team.owner && team.owner.website) socialsHtml += `<a href="${team.owner.website}" target="_blank" style="color:var(--gold);margin:0 10px;font-size:28px;transition:0.3s;"><i class="fa-solid fa-globe"></i></a>`;

    let playersHtml = "";
    if (team.players && team.players.length > 0) {
        team.players.forEach(p => {
            let pName = typeof p === "string" ? p : p.name;
            let fullPlayer = globalPlayers.find(gp => gp.name === pName);
            
            let photoUrl = "";
            let pPosition = "Player";
            let pAge = "";
            let pFoot = "";
            
            if (fullPlayer) {
                photoUrl = getTeamLogoUrl(fullPlayer.photo);
                pPosition = fullPlayer.position || "Player";
                pAge = fullPlayer.age || "";
                pFoot = fullPlayer.foot || "";
            } else if (typeof p === "object") {
                pPosition = p.role || "Player";
            }
            
            let avatarHtml = photoUrl 
                ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : `<i class="fa-solid fa-user"></i>`;
                
            let statsHtml = fullPlayer 
                ? `<div style="display:flex;gap:15px;justify-content:center;margin-top:10px;font-size:12px;color:#888;">
                       ${pAge ? `<span><i class="fa-solid fa-calendar"></i> ${pAge} Yrs</span>` : ''}
                       ${pFoot ? `<span><i class="fa-solid fa-shoe-prints"></i> ${pFoot}</span>` : ''}
                   </div>`
                : "";
            
            playersHtml += `
                <div class="team-player-card">
                    <div class="avatar">${avatarHtml}</div>
                    <h4>${pName}</h4>
                    <p style="color:var(--gold);font-size:13px;font-weight:bold;margin-top:5px;">${pPosition}</p>
                    ${statsHtml}
                </div>
            `;
        });
    } else {
        playersHtml = `<p style="color:#aaa;text-align:center;grid-column:1/-1;margin-top:50px;">Auction Pending / No Players Assigned</p>`;
    }

    modalBack.innerHTML = `
        <div class="team-back-left">
            ${logoHtml}
            <h2>${team.teamName}</h2>
            
            <div style="margin:20px 0;">
                ${socialsHtml}
            </div>

            <div class="team-owner-details">
                <h3>Owner Information</h3>
                <div class="team-owner-row">
                    <i class="fa-solid fa-user-tie"></i>
                    <span>${ownerName}</span>
                </div>
                <div class="team-owner-row">
                    <i class="fa-solid fa-briefcase"></i>
                    <span>${businessName}</span>
                </div>
            </div>
        </div>
        <div class="team-back-right">
            <h3 class="team-players-title">Squad Roster</h3>
            <div class="team-players-grid">
                ${playersHtml}
            </div>
        </div>
    `;

    overlay.classList.add("active");
}

function closeTeamModal() {
    const overlay = document.querySelector(".team-modal-overlay");
    if (overlay) {
        overlay.classList.remove("active");
    }
}

async function loadAllVerifiedPlayers() {
    const grid = document.getElementById("allPlayerGrid");
    if (!grid) return;

    let skeletons = '';
    for (let i = 0; i < 8; i++) {
        skeletons += `
            <div class="skeleton-card" style="padding:0; overflow:hidden;">
                <div class="skeleton skeleton-avatar" style="width: 100%; height: 250px; border-radius: 0;"></div>
                <div style="padding: 20px; text-align: center;">
                    <div class="skeleton skeleton-title" style="margin: 0 auto; width: 60%; margin-bottom: 5px;"></div>
                    <div class="skeleton skeleton-text" style="margin: 0 auto; width: 40%; margin-bottom: 5px;"></div>
                    <div class="skeleton skeleton-text" style="margin: 0 auto; width: 50%; margin-bottom: 15px;"></div>
                    
                    <div style="display:flex; justify-content:center; gap:20px; margin-top:15px; border-top:1px solid rgba(255,255,255,.1); padding-top:15px;">
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <div class="skeleton skeleton-text" style="width:30px; margin-bottom:5px;"></div>
                            <div class="skeleton skeleton-text" style="width:20px;"></div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <div class="skeleton skeleton-text" style="width:30px; margin-bottom:5px;"></div>
                            <div class="skeleton skeleton-text" style="width:40px;"></div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <div class="skeleton skeleton-text" style="width:30px; margin-bottom:5px;"></div>
                            <div class="skeleton skeleton-text" style="width:50px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    grid.innerHTML = skeletons;

    try {
        const players = await fetchWithCache(WEB_APP_URL + "?action=getApprovedPlayers", "nec_approved_players");

        grid.innerHTML = "";

        if (players.length === 0) {
            grid.innerHTML = '<div style="color:white;text-align:center;grid-column:1/-1;padding:20px;">No Verified Players Yet.</div>';
            return;
        }

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

        let currentIndex = 0;
        const BATCH_SIZE = 12;

        const renderNextBatch = () => {
            const batch = players.slice(currentIndex, currentIndex + BATCH_SIZE);
            if (batch.length === 0) return;

            let html = "";
            batch.forEach((player) => {
                const photoUrl = getDirectImageUrl(player.photo);
                html += `
                    <div class="player-card fade-up">
                        <div class="player-photo">
                            <img src="${photoUrl}" alt="Player" loading="lazy">
                        </div>
                        <div class="player-info">
                            <h3>${player.name}</h3>
                            <div class="player-id">${player.id}</div>
                            <div class="player-position">${player.position}</div>
                            <div class="player-stats">
                                <div class="stat">
                                    <span class="label">Age</span>
                                    <span class="value">${player.age || 'N/A'}</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Foot</span>
                                    <span class="value">${player.foot || 'N/A'}</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Exp</span>
                                    <span class="value">${player.experience || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="player-status"><i class="fa-solid fa-check-circle"></i> Verified</div>
                        </div>
                    </div>
                `;
            });

            grid.insertAdjacentHTML("beforeend", html);
            currentIndex += BATCH_SIZE;

            const cards = grid.querySelectorAll(".player-card");
            if (cards.length > 0 && currentIndex < players.length) {
                observer.observe(cards[cards.length - 1]);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                observer.unobserve(entries[0].target);
                renderNextBatch();
            }
        }, { rootMargin: "200px" });

        // Initial render
        renderNextBatch();
    } catch (error) {
        console.error("Error fetching verified players:", error);
        grid.innerHTML = '<div style="color:red;text-align:center;grid-column:1/-1;padding:20px;">Failed to load verified players.</div>';
    }
}
