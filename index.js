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

        e.preventDefault();

        const target = document.querySelector(

            this.getAttribute("href")

        );

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

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
// PAGE LOADED
// =========================================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {
        loader.style.display = "none";
        // ya loader.remove();
    }

    document.body.classList.add("loaded");

    console.log("NEW ERA CUP 2026 Loaded Successfully");

});



// =========================================
// FETCH VERIFIED PLAYERS (HOMEPAGE)
// =========================================

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz42gF4EyG0u82ZUZB6ECxLRMLzLeOce1lSFK6fYM5l-ZUnai-8IwDf0mqRqTL0NT5gDA/exec";

async function loadVerifiedPlayers() {
    const grid = document.getElementById("playerGrid");
    if (!grid) return;

    grid.innerHTML = '<div style="color:white;text-align:center;grid-column:1/-1;padding:20px;">Loading Verified Players...</div>';

    try {
        const response = await fetch(WEB_APP_URL + "?action=getApprovedPlayers");
        const players = await response.json();

        grid.innerHTML = "";

        if (players.length === 0) {
            grid.innerHTML = '<div style="color:white;text-align:center;grid-column:1/-1;padding:20px;">No Verified Players Yet.</div>';
            return;
        }

        // Limit to 4 players for the homepage
        const latestPlayers = players.slice(0, 4);

        // Helper to convert Google Drive URL to direct image URL
       const getDirectImageUrl = (url) => {

    if (!url) {
        return "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop";
    }

    let fileId = "";

    if (url.includes("/d/")) {
        fileId = url.split("/d/")[1].split("/")[0];
    }
    else if (url.includes("id=")) {
        fileId = url.split("id=")[1].split("&")[0];
    }

    if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
    }

    return url;
};

        latestPlayers.forEach((player, index) => {
            // Add staggered delay for animation
            const delay = index * 0.1;
            const photoUrl = getDirectImageUrl(player.photo);
            console.log("Player:", player.name);
console.log("Original URL:", player.photo);
console.log("Converted URL:", photoUrl);
            
            grid.innerHTML += `
                <div class="player-card fade-up" style="animation-delay: ${delay}s">
                    <div class="player-photo">
                        <img src="${photoUrl}" alt="Player">
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

document.addEventListener("DOMContentLoaded", () => {
    loadVerifiedPlayers();
});

// =========================================
// END OF FILE
// =========================================
