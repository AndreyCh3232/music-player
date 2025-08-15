const songs = [
    { file: "song1.mp3", title: "Song 1", cover: "assets/covers/cover-01-neon-wave.svg" },
    { file: "song2.mp3", title: "Song 2", cover: "assets/covers/cover-02-retro-sun.svg" },
    { file: "song3.mp3", title: "Song 3", cover: "assets/covers/cover-03-glass-note.svg" }
]

let songIndex = 0

const audio = document.getElementById("audio")
const playBtn = document.getElementById("play")
const prevBtn = document.getElementById("prev")
const nextBtn = document.getElementById("next")
const progress = document.getElementById("progress")
const volume = document.getElementById("volume")
const title = document.getElementById("song-title")
const cover = document.getElementById("cover")
const currentTimeEl = document.getElementById("current-time")
const durationEl = document.getElementById("duration")

// --- SVG ICONS ---
function icon(name) {
    if (name === "play") return `
    <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
      <path d="M8 5v14l11-7-11-7z" fill="currentColor"/>
    </svg>`;
    if (name === "pause") return `
    <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>
    </svg>`;
    if (name === "prev") return `
    <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
      <path d="M6 6h2v12H6zM20 6l-10 6 10 6V6z" fill="currentColor"/>
    </svg>`;
    if (name === "next") return `
    <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
      <path d="M16 6h2v12h-2zM4 6l10 6-10 6V6z" fill="currentColor"/>
    </svg>`
    return ""
}

prevBtn.innerHTML = icon("prev")
playBtn.innerHTML = icon("play")
nextBtn.innerHTML = icon("next")

function loadSong(i) {
    const s = songs[i]
    audio.src = `songs/${s.file}`
    title.textContent = s.title || s.file
    cover.src = s.cover || "assets/covers/cover-01-neon-wave.svg"
}
loadSong(songIndex)

function fmt(t) {
    if (!Number.isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function playSong() {
    audio.play()
    playBtn.innerHTML = icon("pause")
}

function pauseSong() {
    audio.pause()
    playBtn.innerHTML = icon("play")
}

playBtn.addEventListener("click", () => {
    audio.paused ? playSong() : pauseSong()
})

nextBtn.addEventListener("click", () => {
    songIndex = (songIndex + 1) % songs.length
    loadSong(songIndex)
    playSong()
})
prevBtn.addEventListener("click", () => {
    songIndex = (songIndex - 1 + songs.length) % songs.length
    loadSong(songIndex)
    playSong()
})

audio.addEventListener("timeupdate", () => {
    progress.value = (audio.currentTime / audio.duration) * 100 || 0
    currentTimeEl.textContent = fmt(audio.currentTime)
    durationEl.textContent = fmt(audio.duration)
})

audio.addEventListener("ended", () => {
    nextBtn.click()
})

const volIco = document.querySelector('.vol-ico')
let prevVolume = parseFloat(volume.value) || 1

volIco.setAttribute('role', 'button')
volIco.setAttribute('aria-label', 'השתקה/ביטול השתקה')
volIco.tabIndex = 0

progress.addEventListener("input", () => {
    audio.currentTime = (progress.value / 100) * (audio.duration || 0)
})

function paintVolumeTrack() {
    const pct = (parseFloat(volume.value) * 100).toFixed(0) + '%'
    volume.style.setProperty('--vol', pct)
}

function speakerIcon(state) {
    const base = `<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>`
    const wave1 = `<path d="M16 12c0-2.0-1.1-4-2.5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    const wave1b = `<path d="M13.5 17c1.4-1 2.5-2.8 2.5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    const wave2 = `<path d="M18 12c0-3.3-1.6-6-3.8-7.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    const wave2b = `<path d="M14.2 19.6C16.4 18 18 15.3 18 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    const cross = `<path d="M18 9l4 4m0-4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`

    if (state === 'muted') {
        return `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">${base}${cross}</svg>`
    }
    if (state === 'low') {
        return `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">${base}${wave1}${wave1b}</svg>`
    }
    if (state === 'mid') {
        return `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">${base}${wave1}${wave1b}${wave2}</svg>`
    }
    return `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">${base}${wave1}${wave1b}${wave2}${wave2b}</svg>`
}

function updateSpeakerIcon() {
    const v = parseFloat(volume.value)
    let state = 'high'
    if (audio.muted || v === 0) state = 'muted'
    else if (v <= 0.33) state = 'low'
    else if (v <= 0.66) state = 'mid'
    else state = 'high'

    volIco.innerHTML = speakerIcon(state)
}

function updateVolumeUI() {
    paintVolumeTrack()
    updateSpeakerIcon()
}

volume.addEventListener('input', () => {
    audio.volume = parseFloat(volume.value)
    if (audio.volume === 0) {
        audio.muted = true
    } else {
        audio.muted = false
        prevVolume = audio.volume
    }
    updateVolumeUI()
})

audio.addEventListener('volumechange', updateVolumeUI)

function toggleMute() {
    if (audio.muted || parseFloat(volume.value) === 0) {
        audio.muted = false
        const back = prevVolume > 0 ? prevVolume : 0.5
        volume.value = back.toString()
        audio.volume = back
    } else {
        prevVolume = parseFloat(volume.value) || prevVolume || 0.5
        audio.muted = true
        volume.value = '0'
    }
    updateVolumeUI()
}
volIco.addEventListener('click', toggleMute)
volIco.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMute(); }
})

updateVolumeUI()

volume.addEventListener('input', () => {
    audio.volume = volume.value
    paintVolumeTrack()
})
paintVolumeTrack()

audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = fmt(audio.duration)
})

const volWrap = document.querySelector('.vol-wrap')
const volTip = document.getElementById('vol-tip')

const THUMB = 14

let tipHideTimer

function updateVolTip(show) {
    const min = Number(volume.min) || 0
    const max = Number(volume.max) || 1
    const val = Number(volume.value)

    const percent = (val - min) / (max - min)
    const pctText = Math.round(percent * 100) + '%'
    volTip.textContent = pctText

    const w = volume.clientWidth
    const x = percent * (w - THUMB) + THUMB / 2
    volTip.style.left = `${x}px`

    if (show === true) {
        volTip.classList.add('show')
    } else if (show === false) {
        volTip.classList.remove('show')
    }
}

function peekVolTip() {
    updateVolTip(true)
    clearTimeout(tipHideTimer)
    tipHideTimer = setTimeout(() => updateVolTip(false), 700)
}

volume.addEventListener('pointerdown', () => updateVolTip(true))
volume.addEventListener('input', () => {
    audio.volume = parseFloat(volume.value)
    audio.muted = audio.volume === 0

    if (typeof paintVolumeTrack === 'function') paintVolumeTrack()
    if (typeof updateSpeakerIcon === 'function') updateSpeakerIcon()
    updateVolTip(true)
})
document.addEventListener('pointerup', () => updateVolTip(false))

volume.addEventListener('change', peekVolTip)
volume.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
        setTimeout(peekVolTip, 0)
    }
})

window.addEventListener('resize', () => {
    if (volTip.classList.contains('show')) updateVolTip(true)
})

updateVolTip(false)