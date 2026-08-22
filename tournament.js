
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
                    const fA = data.teams.find(t => t.teamID === m.teamA || t.teamName === m.teamA);
                    if (fA) {
                        tAName = fA.teamName;
                        if (fA.logoURL) tALogo = getTeamLogoUrl(fA.logoURL);
                    }
                    const fB = data.teams.find(t => t.teamID === m.teamB || t.teamName === m.teamB);
                    if (fB) {
                        tBName = fB.teamName;
                        if (fB.logoURL) tBLogo = getTeamLogoUrl(fB.logoURL);
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
        return `https://lh3.googleusercontent.com/d/${id}`;
    }
    if (url.includes('drive.google.com/open?id=')) {
        const id = url.split('id=')[1];
        return `https://lh3.googleusercontent.com/d/${id}`;
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

function renderGroups(groupsData, teamsData) {
    if (!groupsData || Object.keys(groupsData).length === 0) {
        // Fallback to empty standings if no data
        groupsData = {
            A: Array.from({length: 6}, (_, i) => ({ name: `Team A${i+1}`, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 })),
            B: Array.from({length: 6}, (_, i) => ({ name: `Team B${i+1}`, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))
        };
    }

    const groupContainers = {
        A: document.getElementById('groupA-body'),
        B: document.getElementById('groupB-body')
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
            
            let logo = 'assets/logo.png';
            if (teamsData) {
                const matchedTeam = teamsData.find(t => t.teamName === team.name || t.teamID === team.name);
                if (matchedTeam && matchedTeam.logoURL) {
                    logo = getTeamLogoUrl(matchedTeam.logoURL);
                }
            }
            if (team.logo) logo = getTeamLogoUrl(team.logo);

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
    
    // Extract semis chronologically to properly label 1 and 2
    const semis = matches.filter(m => m.stage === 'SemiFinal' || m.stage === 'Semi');

    // Show matches chronologically (first to last)
    const displayMatches = [...matches];

    displayMatches.forEach(m => {
        let tA = { name: m.teamA, logo: 'assets/logo.png' };
        let tB = { name: m.teamB, logo: 'assets/logo.png' };
        
        if (teams) {
            const foundA = teams.find(t => t.teamID === m.teamA || t.teamName === m.teamA);
            if (foundA) {
                tA.name = foundA.teamName;
                if (foundA.logoURL) tA.logo = getTeamLogoUrl(foundA.logoURL);
            }
            const foundB = teams.find(t => t.teamID === m.teamB || t.teamName === m.teamB);
            if (foundB) {
                tB.name = foundB.teamName;
                if (foundB.logoURL) tB.logo = getTeamLogoUrl(foundB.logoURL);
            }
        }
        
        let statusClass = 'status-scheduled';
        let outcomeBadgeText = m.status;
        
        if (m.status === 'Completed') statusClass = 'status-completed';
        if (m.status === 'Live') statusClass = 'status-live';
        
        let crownA = '';
        let crownB = '';
        let classA = '';
        let classB = '';
        
        // Show scores if Completed OR Live
        let scoreA = '-';
        let scoreB = '-';
        if (m.status === 'Completed' || m.status === 'Live') {
            scoreA = m.scoreA || 0;
            scoreB = m.scoreB || 0;
        }

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
        } else if (m.status === 'Live') {
            outcomeBadgeText = `<i class="fa-solid fa-circle" style="font-size:10px; margin-right:5px;"></i>LIVE`;
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

        const mStage = (m.stage || '').trim();
        const matchId = `match-${m.teamA}-${m.teamB}-${mStage.replace(/\s+/g, '-')}`;
        
        // Find absolute chronological match number based on original array
        const matchNum = matches.findIndex(match => match.matchID === m.matchID) + 1;
        
        let displayStage = mStage.toLowerCase().includes('group') ? `${mStage} Match` : `${mStage} Stage`;
        
        if (mStage.toLowerCase() === 'final' || mStage.toLowerCase().includes('third')) {
            displayStage = "Final";
        } else if (mStage === 'SemiFinal' || mStage === 'Semi') {
            const semiIndex = semis.findIndex(s => s.matchID === m.matchID);
            displayStage = `Semi Final - ${semiIndex + 1}`;
        } else if (mStage.toLowerCase().includes('group')) {
            displayStage = `Match No ${matchNum} - Group Stage`;
        }

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
                    <div class="match-score" style="margin: 0 15px;">${scoreA} - ${scoreB}</div>
                    
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
    const populateMatchObj = (domId, match) => {
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
            let logoA = '';
            let logoB = '';

            if (teams) {
                const fA = teams.find(t => t.teamID === match.teamA || t.teamName === match.teamA);
                if (fA) {
                    tAName = fA.teamName;
                    if (fA.logoURL) logoA = `<img src="${getTeamLogoUrl(fA.logoURL)}" style="width:24px;height:24px;border-radius:50%;margin-right:10px;vertical-align:middle;">`;
                }
                const fB = teams.find(t => t.teamID === match.teamB || t.teamName === match.teamB);
                if (fB) {
                    tBName = fB.teamName;
                    if (fB.logoURL) logoB = `<img src="${getTeamLogoUrl(fB.logoURL)}" style="width:24px;height:24px;border-radius:50%;margin-right:10px;vertical-align:middle;">`;
                }
            }

            let isRealA = !tAName.startsWith('Winner') && !tAName.startsWith('Runner-Up') && tAName !== 'TBD' && match.teamA !== "";
            let isRealB = !tBName.startsWith('Winner') && !tBName.startsWith('Runner-Up') && tBName !== 'TBD' && match.teamB !== "";

            let crownHtml = `<i class="fa-solid fa-crown" style="color:var(--gold); margin-left:8px; font-size:16px;"></i>`;
            let crownA = '';
            let crownB = '';

            if (match.status === 'Completed') {
                if (parseInt(match.scoreA) > parseInt(match.scoreB)) crownA = crownHtml;
                else if (parseInt(match.scoreB) > parseInt(match.scoreA)) crownB = crownHtml;
            }

            if (isRealA) {
                teamA_Name.innerHTML = `${logoA}${tAName}${crownA}`;
                teamA_Name.parentElement.style.cursor = 'pointer';
                teamA_Name.parentElement.onclick = () => openTeamJourney(match.teamA);
            }
            if (isRealB) {
                teamB_Name.innerHTML = `${logoB}${tBName}${crownB}`;
                teamB_Name.parentElement.style.cursor = 'pointer';
                teamB_Name.parentElement.onclick = () => openTeamJourney(match.teamB);
            }
            
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

    // Find matches even if they were manually created with random IDs
    const semis = matches.filter(m => m.stage === 'SemiFinal' || m.stage === 'Semi');
    const finals = matches.filter(m => m.stage === 'Final');

    let sf1 = matches.find(m => m.matchID === 'MATCH-SF1') || semis[0];
    let sf2 = matches.find(m => m.matchID === 'MATCH-SF2') || semis[1];
    let f1 = matches.find(m => m.matchID === 'MATCH-F1') || finals[0];

    populateMatchObj('bracket-MATCH-SF1', sf1);
    populateMatchObj('bracket-MATCH-SF2', sf2);
    populateMatchObj('bracket-MATCH-F1', f1);
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
        // Cache tournament data for only 15 seconds to allow rapid Live Score refreshes
        const data = await fetchWithCache(WEB_APP_URL + "?action=getTournamentData", "nec_tournament_data", 15 * 1000);
        window.tournamentDataGlobal = data;
        
        if (data) {
            renderOverview(data);
        }

        if (data && data.groups) {
            renderGroups(data.groups, data.teams);
        } else {
            console.error("No group data received.");
            renderGroups(null, null);
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

        // Smart Live Poller
        if (!window.livePollerSetup) {
            window.livePollerSetup = true;
            setInterval(async () => {
                const hasLive = window.tournamentDataGlobal && window.tournamentDataGlobal.matches && window.tournamentDataGlobal.matches.some(m => m.status === 'Live');
                if (!hasLive) return; // Only poll if there is a Live match
                
                try {
                    // Bypass cache by setting a tiny TTL, but fetch quietly in the background
                    const freshData = await fetchWithCache(WEB_APP_URL + "?action=getTournamentData", "nec_tournament_data", 5000);
                    window.tournamentDataGlobal = freshData;
                    renderOverview(freshData);
                    if (freshData.groups) renderGroups(freshData.groups, freshData.teams);
                    if (freshData.matches) {
                        renderMatches(freshData.matches, freshData.teams);
                        renderKnockoutBracket(freshData.matches, freshData.teams);
                    }
                } catch(e) {
                    console.error("Live Poller failed to fetch fresh data", e);
                }
            }, 15000); // 15 seconds
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
    const numPlaceholders = Math.max(0, 12 - displayTeams.length);
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

function ensureTeamModalInDOM() {
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
}

window.openTeamJourney = function(teamID) {
    if (!window.tournamentDataGlobal || !window.tournamentDataGlobal.teams) return;
    const team = window.tournamentDataGlobal.teams.find(t => t.teamID === teamID || t.teamName === teamID);
    if (team) {
        ensureTeamModalInDOM();
        openTeamModal(team);
    }
};

function openTeamModal(team) {
    const overlay = document.querySelector(".team-modal-overlay");
    if (!overlay) return;
    
    const modalBack = document.getElementById("teamModalBack");
    if (!modalBack) return;

    const logoUrl = getTeamLogoUrl(team.logoURL);
    const logoHtml = logoUrl 
        ? `<img src="${logoUrl}" alt="${team.teamName} Logo">`
        : `<div style="width:180px;height:180px;border-radius:50%;border:4px solid var(--gold);display:flex;justify-content:center;align-items:center;font-size:60px;margin-bottom:25px;background:#333;"><i class="fa-solid fa-shield-halved"></i></div>`;
        
    let ownerName = (team.owner && team.owner.ownerName) ? team.owner.ownerName : "TBA";
    let businessName = (team.owner && team.owner.businessName) ? team.owner.businessName : "TBA";
    
    let socialsHtml = "";
    if (team.owner) {
        if (team.owner.instagram) {
            let insta = String(team.owner.instagram).trim();
            if (!insta.startsWith('http')) {
                insta = insta.replace('@', '');
                insta = `https://instagram.com/${insta}`;
            }
            socialsHtml += `<a href="${insta}" target="_blank" style="color:var(--gold);margin:0 10px;font-size:28px;transition:0.3s;"><i class="fa-brands fa-instagram"></i></a>`;
        }
        if (team.owner.whatsapp) {
            let wa = String(team.owner.whatsapp).trim();
            if (!wa.startsWith('http')) {
                let digits = wa.replace(/\D/g, '');
                if (digits.length === 10) digits = '91' + digits;
                wa = `https://wa.me/${digits}`;
            }
            socialsHtml += `<a href="${wa}" target="_blank" style="color:var(--gold);margin:0 10px;font-size:28px;transition:0.3s;"><i class="fa-brands fa-whatsapp"></i></a>`;
        }
        if (team.owner.facebook) {
            let fb = String(team.owner.facebook).trim();
            if (!fb.startsWith('http')) {
                fb = `https://facebook.com/${fb}`;
            }
            socialsHtml += `<a href="${fb}" target="_blank" style="color:var(--gold);margin:0 10px;font-size:28px;transition:0.3s;"><i class="fa-brands fa-facebook"></i></a>`;
        }
        if (team.owner.website) {
            let web = String(team.owner.website).trim();
            let icon = 'fa-globe';
            if (web.toLowerCase().includes('facebook.com') || web.toLowerCase().includes('fb.me')) icon = 'fa-facebook';
            else if (web.toLowerCase().includes('twitter.com') || web.toLowerCase().includes('x.com')) icon = 'fa-x-twitter';
            else if (web.toLowerCase().includes('youtube.com')) icon = 'fa-youtube';

            if (!web.startsWith('http')) {
                web = `https://${web}`;
            }
            socialsHtml += `<a href="${web}" target="_blank" style="color:var(--gold);margin:0 10px;font-size:28px;transition:0.3s;"><i class="${icon === 'fa-globe' ? 'fa-solid' : 'fa-brands'} ${icon}"></i></a>`;
        }
    }

    const getDirectImageUrl = (url) => {
        if (!url) return "";
        if (url.includes('/d/')) {
            const parts = url.split('/d/');
            if (parts.length > 1) {
                const id = parts[1].split('/')[0];
                return "https://lh3.googleusercontent.com/d/" + id + "=w600?authuser=0";
            }
        }
        return url;
    };

    let playersHtml = "";
    if (team.players && team.players.length > 0) {
        const sortedPlayers = [...team.players].sort((a, b) => {
            let nameA = typeof a === "string" ? a : a.name;
            let nameB = typeof b === "string" ? b : b.name;
            let pA = globalPlayers.find(gp => gp.name === nameA);
            let pB = globalPlayers.find(gp => gp.name === nameB);
            
            let numA = pA && pA.id ? parseInt(String(pA.id).replace(/\D/g, '')) || 999999 : 999999;
            let numB = pB && pB.id ? parseInt(String(pB.id).replace(/\D/g, '')) || 999999 : 999999;
            
            return numA - numB;
        });

        let playerGoalsMap = {};
        let uniqueTournamentGoals = new Set();
        if (window.tournamentDataGlobal && window.tournamentDataGlobal.topScorers) {
            window.tournamentDataGlobal.topScorers.forEach(ts => {
                playerGoalsMap[ts.name] = ts.goals;
                if (ts.goals > 0) {
                    uniqueTournamentGoals.add(ts.goals);
                }
            });
        }

        let sortedTournamentGoals = Array.from(uniqueTournamentGoals).sort((a, b) => b - a);
        let getPlayerRank = (goals) => {
            if (!goals || goals <= 0) return null;
            let index = sortedTournamentGoals.indexOf(goals);
            if (index !== -1 && index < 5) return index + 1; // Ranks 1 to 5
            return null;
        };

        sortedPlayers.forEach(p => {
            let pName = typeof p === "string" ? p : p.name;
            let fullPlayer = globalPlayers.find(gp => gp.name === pName);
            
            let photoUrl = "";
            let pPosition = "Player";
            let pAge = "";
            if (fullPlayer) {
                photoUrl = fullPlayer.photo ? getDirectImageUrl(fullPlayer.photo) : "";
                pPosition = fullPlayer.position || "Player";
                pAge = fullPlayer.age || "";
            }
            
            let pGoals = playerGoalsMap[pName] || 0;
            let rank = getPlayerRank(pGoals);
            
            let tagHtml = "";
            let cardStyle = "";
            let avatarImgStyle = "";
            let nameColor = "";
            let iconShadow = "";
            
            if (rank === 1) {
                tagHtml = `<div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); background: linear-gradient(135deg, #FFD700, #FF8C00); color: #000; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.4); z-index: 10; white-space: nowrap;"><i class="fa-solid fa-crown" style="margin-right:4px;"></i> #1 SCORER</div>`;
                cardStyle = "border: 1px solid rgba(255, 215, 0, 0.3); background: rgba(255, 215, 0, 0.05); transform: translateY(-3px);";
                avatarImgStyle = "border: 3px solid var(--gold); padding: 2px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);";
                nameColor = "color:var(--gold);";
                iconShadow = "text-shadow: 0 0 15px rgba(255, 215, 0, 0.5); color: var(--gold);";
            } else if (rank === 2) {
                tagHtml = `<div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background: linear-gradient(135deg, #E0E0E0, #9E9E9E); color: #000; font-size: 9px; font-weight: 900; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; box-shadow: 0 3px 8px rgba(158, 158, 158, 0.4); z-index: 10; white-space: nowrap;"><i class="fa-solid fa-medal" style="margin-right:4px;"></i> #2 SCORER</div>`;
                avatarImgStyle = "border: 2px solid #C0C0C0; padding: 2px;";
                nameColor = "color:#C0C0C0;";
                iconShadow = "color:#C0C0C0;";
            } else if (rank === 3) {
                tagHtml = `<div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background: linear-gradient(135deg, #CD7F32, #8B4513); color: #fff; font-size: 9px; font-weight: 900; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; box-shadow: 0 3px 8px rgba(205, 127, 50, 0.4); z-index: 10; white-space: nowrap;"><i class="fa-solid fa-medal" style="margin-right:4px;"></i> #3 SCORER</div>`;
                avatarImgStyle = "border: 2px solid #CD7F32; padding: 2px;";
                nameColor = "color:#CD7F32;";
                iconShadow = "color:#CD7F32;";
            } else if (rank === 4 || rank === 5) {
                tagHtml = `<div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 8px; font-weight: 800; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; z-index: 10; white-space: nowrap;">#${rank} SCORER</div>`;
            }
            
            let avatarHtml = photoUrl 
                ? `<img src="${photoUrl}" alt="${pName}" style="${avatarImgStyle}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">`
                : `<i class="fa-solid fa-user" style="${iconShadow}"></i>`;
                
            let statsHtml = fullPlayer 
                ? `<div style="display:flex;gap:15px;justify-content:center;margin-top:10px;font-size:12px;color:#888;">
                       ${pAge ? `<span><i class="fa-solid fa-calendar"></i> ${pAge} Yrs</span>` : ''}
                       ${pGoals > 0 ? `<span style="${nameColor} font-weight: ${rank ? 'bold' : 'normal'};"><i class="fa-solid fa-futbol"></i> ${pGoals} Goals</span>` : ''}
                   </div>`
                : '';
            
            playersHtml += `
                <div class="team-player-card" style="position:relative; ${cardStyle}">
                    ${tagHtml}
                    <div class="avatar">${avatarHtml}</div>
                    <h4 style="${nameColor}">${pName}</h4>
                    <p style="color:rgba(255,255,255,0.6);font-size:13px;font-weight:bold;margin-top:5px;">${pPosition}</p>
                    ${statsHtml}
                </div>
            `;
        });
    } else {
        playersHtml = `<p style="color:#aaa; grid-column: 1 / -1; text-align:center;">No players registered yet.</p>`;
    }

    // JOURNEY HTML
    let journeyHtml = `<div class="team-journey" style="width:100%; max-width:800px; margin:0 auto; padding-top:20px;">`;
    
    if (window.tournamentDataGlobal && window.tournamentDataGlobal.matches) {
        const playedMatches = window.tournamentDataGlobal.matches.filter(m => 
            (m.teamA === team.teamID || m.teamB === team.teamID) && m.status === 'Completed'
        );
        
        if (playedMatches.length === 0) {
            journeyHtml += `<p style="color:#aaa; font-size:16px; text-align:center; margin-top:50px;">No matches played yet.</p>`;
        } else {
            journeyHtml += `<div class="journey-timeline" style="display:flex; flex-direction:column; gap:15px; width:100%;">`;
            playedMatches.forEach(m => {
                let isTeamA = m.teamA === team.teamID;
                let myScore = isTeamA ? parseInt(m.scoreA) : parseInt(m.scoreB);
                let oppScore = isTeamA ? parseInt(m.scoreB) : parseInt(m.scoreA);
                let oppTeamID = isTeamA ? m.teamB : m.teamA;
                
                let oppTeamObj = window.tournamentDataGlobal.teams.find(t => t.teamID === oppTeamID);
                let oppName = oppTeamObj ? oppTeamObj.teamName : oppTeamID;
                let oppLogo = oppTeamObj ? getTeamLogoUrl(oppTeamObj.logoURL) : 'assets/logo.png';
                
                let resultClass = "";
                let resultText = "";
                let resultColor = "";
                if (myScore > oppScore) {
                    resultClass = "color:#4ade80;"; // green
                    resultColor = "#4ade80";
                    resultText = "WON";
                } else if (myScore < oppScore) {
                    resultClass = "color:#f87171;"; // red
                    resultColor = "#f87171";
                    resultText = "LOST";
                } else {
                    resultClass = "color:#fbbf24;"; // yellow
                    resultColor = "#fbbf24";
                    resultText = "DRAW";
                }
                
                let stageName = m.stage || "Group Stage";
                if (stageName === "SemiFinal") stageName = "Semi-Final";
                if (stageName === "Final") stageName = "Final";
                
                journeyHtml += `
                    <div style="background:rgba(255,255,255,0.05); padding:15px 20px; border-radius:12px; border-left:6px solid ${resultColor}; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 10px rgba(0,0,0,0.3); width:100%;">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <img src="${oppLogo}" style="width:40px; height:40px; border-radius:50%; border:2px solid #444; object-fit:cover;">
                            <div>
                                <div style="font-size:12px; color:var(--gold); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">${stageName}</div>
                                <div style="font-size:18px; font-weight:bold; color:#fff;">vs ${oppName}</div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:24px; font-family:monospace; font-weight:bold; ${resultClass}">${myScore} - ${oppScore}</div>
                            <div style="font-size:12px; font-weight:bold; letter-spacing:2px; ${resultClass}">${resultText}</div>
                        </div>
                    </div>
                `;
            });
            journeyHtml += `</div>`;
        }
    } else {
        journeyHtml += `<p style="color:#aaa; font-size:16px; text-align:center; margin-top:50px;">Journey data unavailable.</p>`;
    }
    journeyHtml += `</div>`;

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
            
            <div class="team-tab-toggles" style="display:flex; justify-content:center; gap:30px; margin-top:40px; background:rgba(0,0,0,0.3); padding:15px; border-radius:30px;">
                <button onclick="document.getElementById('teamRosterContent').style.display='block'; document.getElementById('teamJourneyContent').style.display='none'; this.style.color='var(--gold)'; this.nextElementSibling.style.color='#aaa';" style="background:transparent; border:none; color:var(--gold); font-size:26px; cursor:pointer; transition:0.3s;" title="Squad Roster"><i class="fa-solid fa-users"></i></button>
                <button onclick="document.getElementById('teamJourneyContent').style.display='block'; document.getElementById('teamRosterContent').style.display='none'; this.style.color='var(--gold)'; this.previousElementSibling.style.color='#aaa';" style="background:transparent; border:none; color:#aaa; font-size:26px; cursor:pointer; transition:0.3s;" title="Tournament Journey"><i class="fa-solid fa-route"></i></button>
            </div>
        </div>
        <div class="team-back-right">
            <div id="teamRosterContent">
                <h3 class="team-players-title">Squad Roster</h3>
                <div class="team-players-grid">
                    ${playersHtml}
                </div>
            </div>
            <div id="teamJourneyContent" style="display:none; width:100%; height:100%;">
                <h3 class="team-players-title">Tournament Journey</h3>
                ${journeyHtml}
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
