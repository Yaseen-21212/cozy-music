// --- Music Playlist Config ---
const playlist = [
    { title: "Morningside", src: "audio/Morningside.mp3" },
    { title: "Glow", src: "audio/glow.mp3" },
    { title: "Sunflowers", src: "audio/Sunflowers.mp3" },
    { title: "Sky Wires", src: "audio/SkyWires.mp3" },
    { title: "Cradle", src: "audio/Cradle.mp3" },
    { title: "Snowfall", src: "audio/Snowfall.mp3" },
    { title: "Slowfade", src: "audio/Slowfade.mp3" },
    { title: "Golden Hour", src: "audio/GoldenHour.mp3" }
];

let currentTrackIndex = 0;
let isPlaying = false;
let lofiAudio = new Audio();

// Elements
const playBtn = document.getElementById('play-btn');
const trackTitle = document.getElementById('track-title');
const tracklistContainer = document.getElementById('tracklist-container');
const rainAudio = document.getElementById('rain-audio');
const fireAudio = document.getElementById('fire-audio');
const rainSlider = document.getElementById('rain-slider');
const fireSlider = document.getElementById('fire-slider');

// 1. Generate the visual tracklist menu items dynamically
function buildTracklistMenu() {
    tracklistContainer.innerHTML = ""; // Clear box
    
    playlist.forEach((track, index) => {
        const trackRow = document.createElement('div');
        trackRow.classList.add('playlist-item');
        trackRow.innerText = `${index + 1}. ${track.title}`;
        
        // Let the user click directly on a row to jump straight to that song!
        trackRow.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            if (isPlaying) {
                lofiAudio.play();
            } else {
                // If paused, simulate a click on play to start it up
                playBtn.click();
            }
        });
        
        tracklistContainer.appendChild(trackRow);
    });
}

// 2. Load track and update styling states
function loadTrack(index) {
    lofiAudio.src = playlist[index].src;
    trackTitle.innerText = playlist[index].title;
    
    // Highlight active track in the scrolling menu list
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active-track');
            // Automatically scrolls the container to show the active track if it's buried down low
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active-track');
        }
    });
}

// Initialize the track list first, then load track zero
buildTracklistMenu();
loadTrack(currentTrackIndex);

// Main play/pause button actions
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        lofiAudio.pause();
        playBtn.innerText = "▶ Play";
    } else {
        lofiAudio.play().catch(e => console.log("Audio waiting for user context."));
        playBtn.innerText = "⏸ Pause";
    }
    isPlaying = !isPlaying;
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    
    // Fix: Capitalized "Audio" and forced it to play instantly, updating the UI state
    lofiAudio.play().catch(e => console.log("Playback error: ", e));
    isPlaying = true;
    playBtn.innerText = "⏸ Pause";
});

document.getElementById('prev-btn').addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    
    // Fix: Capitalized "Audio" and forced it to play instantly, updating the UI state
    lofiAudio.play().catch(e => console.log("Playback error: ", e));
    isPlaying = true;
    playBtn.innerText = "⏸ Pause";
});

lofiAudio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    lofiAudio.play().catch(e => console.log("Playback error: ", e));
    
    // Extra safety: Make sure UI stays on pause button when auto-advancing
    isPlaying = true;
    playBtn.innerText = "⏸ Pause";
});

// (Keep the rest of your ambient mixer, cat petting, and theme toggle code exactly as it was!)

let audioContext;
let fireGainNode;

function handleAmbientMixer(slider, audioEl, readoutId) {
    const indicator = document.getElementById(readoutId);
    
    // 💡 FIX 1: Ensure GitHub allows streaming cross-origin audio through the Web Audio API
    audioEl.crossOrigin = "anonymous";
    
    if (audioEl.id === 'fire-audio') {
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaElementSource(audioEl);
                fireGainNode = audioContext.createGain();
                source.connect(fireGainNode);
                fireGainNode.connect(audioContext.destination);
            }
            
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            fireGainNode.gain.value = val * 3; 
            
            if (val == 0) {
                indicator.innerText = "Off";
                audioEl.pause();
            } else {
                indicator.innerText = `${Math.round(val * 100)}%`;
                // 💡 FIX 2: Ensure the HTML audio element explicitly loops
                audioEl.loop = true; 
                if (audioEl.paused) {
                    audioEl.play().catch(o => console.log("Fire playback blocked:", o));
                }
            }
        });
    } else {
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            audioEl.volume = val;
            
            if (val == 0) {
                indicator.innerText = "Off";
                audioEl.pause();
            } else {
                indicator.innerText = `${Math.round(val * 100)}%`;
                // 💡 FIX 3: Ensure the rain audio element explicitly loops
                audioEl.loop = true; 
                if (audioEl.paused) {
                    audioEl.play().catch(o => console.log("Rain playback blocked:", o));
                }
            }
        });
    }
}

// 💡 FIX 2: Ensure these lines are placed at the very BOTTOM of your script.js file,
// AFTER the DOM elements (rainSlider, rainAudio, etc.) have been declared.
handleAmbientMixer(rainSlider, rainAudio, 'rain-val');
handleAmbientMixer(fireSlider, fireAudio, 'fire-val');;

// --- Pet Interactions & Hearts ---
let purrCount = 0;
const moods = ["(=ↀωↀ=) Purrrr...", "(*✧×✧*) Happy!", "(😺) More pets!", "(🐾) Cozy vibe."];

function petCat() {
    purrCount++;
    document.getElementById('pet-count').innerText = purrCount;
    
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    document.getElementById('cat-status').innerText = randomMood;
    
    // Animate sprite
    const sprite = document.getElementById('cat-sprite');
    sprite.style.transform = "scale(1.25) rotate(5deg)";
    setTimeout(() => sprite.style.transform = "scale(1) rotate(0deg)", 150);

    // Spawn floating heart particle
    const container = document.getElementById('heart-container');
    const heart = document.createElement('span');
    heart.classList.add('heart');
    heart.innerText = "💖";
    heart.style.left = `${Math.random() * 60 + 20}%`;
    container.appendChild(heart);
    
    setTimeout(() => heart.remove(), 800);
}

// --- Theme Active State Switcher ---
function setTheme(themeName, element) {
    // 1. Swap attribute on HTML root
    document.documentElement.setAttribute('data-theme', themeName);
    
    // 2. Clear out existing active classes on button tray
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 3. Mark clicked button active
    element.classList.add('active');
}
// 1. Grab the new DOM Elements (Add these near your other element definitions)
const progressWrapper = document.getElementById('progress-wrapper');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

// 2. Helper function to format raw seconds into clean MM:SS strings
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 3. Listen for time updates to move the bar fill and update the elapsed minutes timer
lofiAudio.addEventListener('timeupdate', () => {
    if (lofiAudio.duration) {
        const percentage = (lofiAudio.currentTime / lofiAudio.duration) * 100;
        progressFill.style.width = `${percentage}%`;
        currentTimeEl.innerText = formatTime(lofiAudio.currentTime);
    }
});

// 4. Listen for when a song file loads to calculate and display its total minute length
lofiAudio.addEventListener('loadedmetadata', () => {
    totalDurationEl.innerText = formatTime(lofiAudio.duration);
});

// Look for this block at the bottom of your script.js file:
progressWrapper.addEventListener('click', (e) => {
    const width = progressWrapper.clientWidth;
    const clickX = e.offsetX; // Detects exactly where you tapped
    const duration = lofiAudio.duration; // <-- CHECK THIS LINE: change 'lofiaudio' to 'lofiAudio'
    
    if (duration) {
        lofiAudio.currentTime = (clickX / width) * duration; // Jumps to that part of the song
    }
});