// =========================================
// NEW ERA CUP 2026
// index.js
// Part 1
// =========================================


// =========================================
// HERO VIDEO
// =========================================

const heroVideo = document.querySelector(".hero-video");

if (heroVideo) {

    heroVideo.muted = true;

    heroVideo.autoplay = true;

    heroVideo.loop = true;

    heroVideo.playsInline = true;

    heroVideo.play().catch(() => {

        console.log("Autoplay blocked.");

    });

}



// =========================================
// COUNTDOWN DATE
// =========================================

// CHANGE THIS DATE

const eventDate = new Date(

    "August 22, 2026 12:00:00"

).getTime();



// =========================================
// COUNTDOWN ELEMENTS
// =========================================

const days = document.getElementById("days");

const hours = document.getElementById("hours");

const minutes = document.getElementById("minutes");

const seconds = document.getElementById("seconds");



// =========================================
// COUNTDOWN FUNCTION
// =========================================

function updateCountdown(){

    const now = new Date().getTime();

    const distance = eventDate - now;

    if(distance <= 0){

        clearInterval(timer);

        if(days) days.innerHTML="00";

        if(hours) hours.innerHTML="00";

        if(minutes) minutes.innerHTML="00";

        if(seconds) seconds.innerHTML="00";

        return;

    }

    const d = Math.floor(

        distance / (1000*60*60*24)

    );

    const h = Math.floor(

        (distance%(1000*60*60*24))

        /(1000*60*60)

    );

    const m = Math.floor(

        (distance%(1000*60*60))

        /(1000*60)

    );

    const s = Math.floor(

        (distance%(1000*60))/1000

    );

    if(days) days.innerHTML = String(d).padStart(2,"0");

    if(hours) hours.innerHTML = String(h).padStart(2,"0");

    if(minutes) minutes.innerHTML = String(m).padStart(2,"0");

    if(seconds) seconds.innerHTML = String(s).padStart(2,"0");

}

let timer;

timer = setInterval(updateCountdown, 1000);

updateCountdown();
// =========================================
// PART 2
// NAVBAR + HEADER + ACTIVE MENU
// =========================================

// HEADER

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if(window.scrollY > 80){

        header.style.background = "rgba(0,0,0,.92)";
        header.style.backdropFilter = "blur(18px)";
        header.style.boxShadow = "0 10px 30px rgba(0,0,0,.45)";

    }

    else{

        header.style.background = "rgba(0,0,0,.65)";
        header.style.backdropFilter = "blur(12px)";
        header.style.boxShadow = "none";

    }

});

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if(menuBtn && navMenu){

    menuBtn.addEventListener("click",()=>{

        navMenu.classList.toggle("active");

    });

}
// =========================================
// ACTIVE MENU
// =========================================

const sections = document.querySelectorAll("section");

const navLinks = document.querySelectorAll("#navMenu a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section=>{

        const sectionTop = section.offsetTop - 120;

        const sectionHeight = section.clientHeight;

        if(window.scrollY >= sectionTop){

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link=>{

        link.classList.remove("active");

        if(link.getAttribute("href") == "#" + current){

            link.classList.add("active");

        }

    });

});


// =========================================
// SMOOTH SCROLL
// =========================================

navLinks.forEach(link=>{

    link.addEventListener("click",function(e){

        const href = this.getAttribute("href");

        if (href.startsWith("#")) {
            e.preventDefault();

            const target = document.querySelector(href);

            if(target){

                target.scrollIntoView({

                    behavior:"smooth"

                });

            }
        }

    });

});


// =========================================
// BUTTON SCROLL
// =========================================

const registerBtn = document.querySelector(".hero .btn-primary");

if(registerBtn){

    registerBtn.addEventListener("mouseenter",()=>{

        registerBtn.style.transform = "scale(1.05)";

    });

    registerBtn.addEventListener("mouseleave",()=>{

        registerBtn.style.transform = "scale(1)";

    });

}
// =========================================
// PART 3
// SCROLL REVEAL + TOP BUTTON + EFFECTS
// =========================================


// =========================================
// SCROLL REVEAL
// =========================================

const revealElements = document.querySelectorAll(
".about-card, .player-card, .rule-card, .contact-card, .highlight-card, .step"
);

const observer = new IntersectionObserver(

(entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("fade-up");

        }

    });

},

{

    threshold:0.15

}

);

revealElements.forEach(el=>{

    observer.observe(el);

});



// =========================================
// SCROLL TO TOP
// =========================================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll",()=>{

    if(!topBtn) return;

    if(window.scrollY > 500){

        topBtn.style.display="flex";

    }

    else{

        topBtn.style.display="none";

    }

});

if(topBtn){

topBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

}



// =========================================
// CARD HOVER EFFECT
// =========================================

document.querySelectorAll(".about-card, .highlight-card").forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;

const y = e.clientY - rect.top;

card.style.background =

`radial-gradient(circle at ${x}px ${y}px,

rgba(255,215,0,.18),

rgba(255,255,255,.05))`;

});

card.addEventListener("mouseleave",()=>{

card.style.background="rgba(255,255,255,.05)";

});

});



// =========================================
// HERO PARALLAX
// =========================================

const hero = document.querySelector(".hero");

window.addEventListener("scroll",()=>{

if(hero){

hero.style.backgroundPositionY=

window.scrollY*0.45+"px";

}

});



// =========================================
// IMAGE LAZY ANIMATION
// =========================================

document.querySelectorAll("img").forEach(img=>{

img.loading="lazy";

});


// =========================================
// PUBLIC DATA (SETTINGS & SPONSORS)
// =========================================

// =========================================
// FETCH WITH CACHE HELPER
// =========================================
async function fetchWithCache(url, cacheKey, ttl = 300000) {
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheKey + '_time');
    const now = new Date().getTime();

    if (cachedData && cacheTime && now - parseInt(cacheTime) < ttl) {
        try {
            return JSON.parse(cachedData);
        } catch(e) {
            localStorage.removeItem(cacheKey);
        }
    }

    let retries = 3;
    while (retries > 0) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const text = await response.text();
            
            // If Google returns HTML instead of JSON (due to rate limiting), throw to trigger retry
            if (text.includes("<!DOCTYPE") || text.includes("<html")) {
                throw new Error("Received HTML instead of JSON. Rate limit or server error.");
            }
            
            const data = JSON.parse(text);
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(cacheKey + '_time', now);
            return data;
        } catch (error) {
            retries--;
            console.warn(`Fetch failed for ${cacheKey}. Retries left: ${retries}`, error);
            if (retries === 0) {
                console.error("All retries failed for", cacheKey);
                return [];
            }
            // Exponential backoff: wait 1s, then 2s
            await new Promise(res => setTimeout(res, (3 - retries) * 1000));
        }
    }
}

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz42gF4EyG0u82ZUZB6ECxLRMLzLeOce1lSFK6fYM5l-ZUnai-8IwDf0mqRqTL0NT5gDA/exec";

// =========================================
// PAGE LOADED
// =========================================

let isWindowLoaded = false;

function checkAndHideLoader() {
    if (isWindowLoaded) {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }
        document.body.classList.add("loaded");
        console.log("NEW ERA CUP 2026 Loaded Successfully");
    }
}

window.addEventListener("load", () => {
    isWindowLoaded = true;
    checkAndHideLoader();
});




// =========================================
// FETCH VERIFIED PLAYERS (HOMEPAGE)
// =========================================


async function loadVerifiedPlayers() {
    const grid = document.getElementById("playerGrid");
    if (!grid) return;

    let skeletons = '';
    for (let i = 0; i < 4; i++) {
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

        // Limit to 4 players for the homepage
        const latestPlayers = players.slice(0, 4);

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

        latestPlayers.forEach((player, index) => {
            // Add staggered delay for animation
            const delay = index * 0.1;
            const photoUrl = getDirectImageUrl(player.photo);
            
            grid.innerHTML += `
                <div class="player-card fade-up" style="animation-delay: ${delay}s">
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
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div style="color:red;text-align:center;grid-column:1/-1;padding:20px;">Failed to load players. Please try again later.</div>';
    }
}

// =========================================
// FETCH TEAMS (HOMEPAGE)
// =========================================

async function loadTeams() {
    const grid = document.getElementById("teamGrid");
    if (!grid) return;

    try {
        const teams = await fetchWithCache(WEB_APP_URL + "?action=getTeams", "nec_teams");
        const allPlayers = await fetchWithCache(WEB_APP_URL + "?action=getApprovedPlayers", "nec_approved_players") || [];

        const isDedicatedPage = window.location.pathname.includes("teams.html");
        let displayTeams = teams || [];
        
        if (!isDedicatedPage) {
            displayTeams = [...displayTeams].sort(() => 0.5 - Math.random());
        }
        
        const maxDisplay = 16;
        const numPlaceholders = Math.max(0, maxDisplay - displayTeams.length);
        let html = "";

        const getDirectImageUrl = (url) => {
            if (!url) return '';
            if (url.includes('/d/')) {
                const idMatch = url.match(/\/d\/([^\/]+)/);
                if (idMatch && idMatch[1]) {
                    return "https://lh3.googleusercontent.com/d/" + idMatch[1] + "=w600?authuser=0";
                }
            }
            if (url.includes('id=')) {
                const idMatch = url.match(/id=([^&]+)/);
                if (idMatch && idMatch[1]) {
                    return "https://lh3.googleusercontent.com/d/" + idMatch[1] + "=w600?authuser=0";
                }
            }
            return url;
        };

        if (displayTeams.length > 0) {
            displayTeams.forEach((team, i) => {
                const logoUrl = getDirectImageUrl(team.logoURL);
                const logoHtml = logoUrl 
                    ? `<img src="${logoUrl}" alt="${team.teamName} Logo" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                    : `<i class="fa-solid fa-shield-halved"></i>`;
                
                let ownerName = (team.owner && team.owner.ownerName) ? team.owner.ownerName : "TBA";
                let businessName = (team.owner && team.owner.businessName) ? team.owner.businessName : "TBA";
                let frontOwnerStatus = (ownerName !== "TBA") ? `Owner: ${ownerName}` : "Owner: Coming Soon";
                
                let avatarsHtml = "";
                if (team.players && team.players.length > 0) {
                    let count = 0;
                    for (let p of team.players) {
                        if (count >= 3) break;
                        let pName = typeof p === 'string' ? p : p.name;
                        let fp = allPlayers.find(x => x.name === pName);
                        let pPhoto = fp ? getDirectImageUrl(fp.photo) : "";
                        let content = pPhoto ? `<img src="${pPhoto}">` : `<i class="fa-solid fa-user"></i>`;
                        avatarsHtml += `<div class="mini-avatar">${content}</div>`;
                        count++;
                    }
                    if (team.players.length > 3) {
                        avatarsHtml += `<div class="mini-avatar" style="font-weight:bold; font-size:12px;">+${team.players.length - 3}</div>`;
                    }
                } else {
                    avatarsHtml = `<div style="color:#aaa;font-size:13px;">Auction Pending</div>`;
                }

                html += `
                    <div class="team-card" onclick="this.classList.toggle('flipped');">
                        <div class="card-inner">
                            <div class="card-front">
                                <div class="team-logo-placeholder">
                                    ${logoHtml}
                                </div>
                                <h3>${team.teamName || 'Team ' + (i + 1)}</h3>
                                <span class="owner-status">${frontOwnerStatus}</span>
                            </div>
                            <div class="card-back">
                                <h3>${team.teamName || 'Team ' + (i + 1)}</h3>
                                <div class="coming-soon-details">
                                    <div class="detail-row">
                                        <i class="fa-solid fa-user-tie"></i>
                                        <span>${ownerName}</span>
                                    </div>
                                    <div class="mini-avatars-container">
                                        ${avatarsHtml}
                                    </div>
                                    <a href="teams.html" class="view-roster-btn">View Full Roster</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        for (let i = 0; i < numPlaceholders; i++) {
            const index = displayTeams.length + i + 1;
            html += `
                <div class="team-card" onclick="this.classList.toggle('flipped');">
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="team-logo-placeholder">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <h3>Team ${index}</h3>
                            <span class="owner-status">Owner: Coming Soon</span>
                        </div>
                        <div class="card-back">
                            <h3>Team ${index}</h3>
                            <div class="coming-soon-details">
                                <div class="detail-row">
                                    <i class="fa-solid fa-user-tie"></i>
                                    <span>Owner: TBA</span>
                                </div>
                                <div class="mini-avatars-container">
                                    <div style="color:#aaa;font-size:13px;">Auction Pending</div>
                                </div>
                                <a href="teams.html" class="view-roster-btn" style="opacity:0.5;pointer-events:none;">View Full Roster</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = html;

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div style="color:red;text-align:center;grid-column:1/-1;padding:20px;">Failed to load teams. Please try again later.</div>';
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadVerifiedPlayers();
    await loadTeams();
});

// =========================================
// END OF FILE
// =========================================