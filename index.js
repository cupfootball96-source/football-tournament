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
// DISABLE RIGHT CLICK (OPTIONAL)
// =========================================

// document.addEventListener("contextmenu",e=>{

//     e.preventDefault();

// });



// =========================================
// DISABLE F12 (OPTIONAL)
// =========================================

// document.addEventListener("keydown",function(e){

// if(e.key==="F12"){

// e.preventDefault();

// }

// });



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
// END OF FILE
// =========================================