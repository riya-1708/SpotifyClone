let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder){
    currFolder = folder;
    let files = await fetch(`/${folder}`)
    let response = await files.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    return songs;
}

const playMusic = async (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        const playButton = document.querySelector('.play-pause-btn');
        playButton.innerHTML =  
                    `<svg viewBox="0 0 16 16" fill="currentColor">
                         <path d="M5 3a1 1 0 0 1 1-1h.5a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5H6a1 1 0 0 1-1-1V3zM9 3a1 1 0 0 1 1-1h.5a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5H10a1 1 0 0 1-1-1V3z"/>
                    </svg>`;
    }
    document.querySelector(".song-title").innerHTML = `<a href="#" draggable="false">${decodeURI(track)}</a>`
    // document.querySelector(".time-display").innerHTML = "00:00"
    
    

}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Helper function to create card HTML safely
function createCardHTML(folder, response, basePath) {
    const card = document.createElement('div');
    card.className = 'card span-hover';
    card.dataset.folder = folder;
    card.dataset.basePath = basePath; // Store base path for event delegation
    
    card.innerHTML = `
        <div class="imgContainer">
            <div>
                <img src="/${basePath}/${folder}/cover.${basePath === 'songs' ? 'jpg' : 'jpeg'}" alt="">
            </div>
            <button class="play-button">
                <svg data-encore-id="icon" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"
                  class="play-button-icon" viewBox="0 0 24 24">
                  <path
                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                  </path>
                </svg>
            </button>
        </div>
        <p class="title"><span></span></p>
        <p><span></span></p>
    `;
    
    // Safely set text content
    card.querySelector('.title span').textContent = response.title;
    card.querySelector('p:last-child span').textContent = response.description;
    
    return card;
}

async function displayAlbums() {
    console.log("displaying albums")
    try {
        let a = await fetch(`/songs/`)
        let response = await a.text();
        let div = document.createElement("div")
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        let cardContainer = document.querySelector(".list-trendingalbums")
        
        if (!cardContainer) {
            console.error("Album container not found");
            return;
        }
        
        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index]; 
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0]
                try {
                    // Get the metadata of the folder
                    let a = await fetch(`/songs/${folder}/info.json`)
                    let response = await a.json(); 
                    
                    // Create card safely
                    const card = createCardHTML(folder, response, 'songs');
                    cardContainer.appendChild(card);
                } catch (error) {
                    console.error(`Error loading album ${folder}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

async function displayTrendingSongs() {
    console.log("displaying Trending songs")
    try {
        let a = await fetch(`/TrendingSongs/`)
        let response = await a.text();
        let div = document.createElement("div")
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        let cardContainer = document.querySelector(".list-trendingsongs")
        
        if (!cardContainer) {
            console.error("Trending songs container not found");
            return;
        }
        
        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index]; 
            if (e.href.includes("/TrendingSongs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0]
                try {
                    // Get the metadata of the folder
                    let a = await fetch(`/TrendingSongs/${folder}/info.json`)
                    let response = await a.json(); 
                    
                    // Create card safely
                    const card = createCardHTML(folder, response, 'TrendingSongs');
                    cardContainer.appendChild(card);
                } catch (error) {
                    console.error(`Error loading trending song ${folder}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error displaying trending songs:", error);
    }
}

// EVENT DELEGATION - Single event listener for all cards
function setupEventDelegation() {
    document.addEventListener('click', async (event) => {
        
        // Check if clicked element is a card or inside a card
        const playBar = document.querySelector('.playbar');
        const signupFooter = document.querySelector('.signup-footer');
        const card = event.target.closest('.card');
        
        if (card) {
            
            playBar.style.display = "flex";
            signupFooter.style.display = "none";
            const folder = card.dataset.folder;
            const basePath = card.dataset.basePath || 'songs'; // Default to songs if not set
            
            if (folder) {
                console.log("Fetching Songs")
                try {
                    songs = await getSongs(`${basePath}/${folder}`)
                    let a = await fetch(`${basePath}/${folder}/info.json`)
                    let response = await a.json(); 
                    document.querySelector(".song-artists").innerHTML = `<a href="#" draggable="false">${response.description}</a>`

                    // let img = await fetch(`${basePath}/${folder}/cover.${basePath === 'songs' ? 'jpg' : 'jpeg'}`)
                    document.querySelector(".album-cover__image").src = `/${basePath}/${folder}/cover.${basePath === 'songs' ? 'jpg' : 'jpeg'}`
                    

                    if (songs.length > 0) {
                        playMusic(songs[0])
                    } else {
                        console.warn("No songs found in folder:", folder);
                    }
                } catch (error) {
                    console.error("Error fetching songs:", error);
                }
            }
        }
        
        // Handle play/pause button
        const playButton = event.target.closest('.play-pause-btn');
        
        if (playButton) {
            try {
                console.log("Play button clicked");
               
                if (currentSong.paused) {
                    await currentSong.play()
                    
                    playButton.innerHTML =  
                    `<svg viewBox="0 0 16 16" fill="currentColor">
                         <path d="M5 3a1 1 0 0 1 1-1h.5a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5H6a1 1 0 0 1-1-1V3zM9 3a1 1 0 0 1 1-1h.5a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5H10a1 1 0 0 1-1-1V3z"/>
                    </svg>`;
                 
                } else {
                    currentSong.pause()
                    playButton.innerHTML =  
                        `<svg viewBox="0 0 16 16" fill="currentColor">
                        <path
                        d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z" />
                        </svg>`;
                }
            } catch (error) {
                console.error("Error playing/pausing song:", error);
            }
        }
        const previous = event.target.closest('#previous');
        if (previous) {
            console.log("Previous button clicked");
            const currentIndex = songs.indexOf(currentSong.src.split('/').pop());
            if (currentIndex > 0) {
                playMusic(songs[currentIndex - 1]);
            } else {
                console.warn("No previous song available");
            }
        }

        const next = event.target.closest('#next');
        if (next) {
            console.log("Next button clicked");
            const currentIndex = songs.indexOf(currentSong.src.split('/').pop());
            if (currentIndex < songs.length - 1) {
                playMusic(songs[currentIndex + 1]);
            } else {
                console.warn("No next song available");
            }
        }

        const progressBar = event.target.closest('.progress-bar-container');

        if (progressBar) {
            console.log("Progress bar clicked");
            const percent = (event.offsetX / progressBar.getBoundingClientRect().width) * 100;
            currentSong.currentTime = (currentSong.duration * percent) / 100;
            document.querySelector(".progress-bar").style.width = percent + "%";
            document.querySelector(".progress-handle").style.left = percent + "%";
        }
    });
}

async function main() {
    // Setup event delegation ONCE
    setupEventDelegation();
    
    // Display content
    await displayTrendingSongs();
    await displayAlbums();

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".time-display").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".duration-display").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`
        document.querySelector(".progress-bar").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".progress-handle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        
    })

    
    




   
}

main();