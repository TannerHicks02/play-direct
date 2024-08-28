
document.getElementById("chooseFolder").addEventListener("click", async () => {
    const directoryHandle = await window.showDirectoryPicker();
    const sidebar = document.getElementById("sidebar");
    const audioRow = document.getElementById("audioRow");
    const videoRow = document.getElementById("videoRow");
    const audioHeader = document.getElementById("audioHeader");
    const videoHeader = document.getElementById("videoHeader");

    audioRow.innerHTML = "";
    videoRow.innerHTML = "";
    sidebar.innerHTML = "";

    let hasAudio = false;
    let hasVideo = false;

    // Initialize the parent folder in the sidebar
    const parentFolderItem = document.createElement("li");
    parentFolderItem.classList.add("list-group-item");
    parentFolderItem.textContent = directoryHandle.name;
    parentFolderItem.addEventListener("click", () => {
        loadMediaFiles(directoryHandle);
        setActiveFolder(parentFolderItem); // Highlight the parent folder
    });
    sidebar.appendChild(parentFolderItem);

    // Load child folders into the sidebar
    for await (const entry of directoryHandle.values()) {
        if (entry.kind === "directory") {
            const childFolderItem = document.createElement("li");
            childFolderItem.classList.add("list-group-item");
            childFolderItem.textContent = entry.name;
            childFolderItem.addEventListener("click", () => {
                loadMediaFiles(entry);
                setActiveFolder(childFolderItem); // Highlight the selected child folder
            });
            sidebar.appendChild(childFolderItem);
        }
    }

    // Function to load media files from the selected folder
    async function loadMediaFiles(folderHandle) {
        audioRow.innerHTML = "";
        videoRow.innerHTML = "";
        hasAudio = false;
        hasVideo = false;

        for await (const entry of folderHandle.values()) {
            if (entry.kind === "file") {
                const file = await entry.getFile();
                const url = URL.createObjectURL(file);

                if (file.type.startsWith("audio")) {
                    audioRow.appendChild(createMediaElement("audio", url, file.name));
                    hasAudio = true;
                } else if (file.type.startsWith("video")) {
                    videoRow.appendChild(createMediaElement("video", url, file.name));
                    hasVideo = true;
                }
            }
        }

        // Update visibility of audio and video headers
        audioHeader.classList.toggle("hidden", !hasAudio);
        videoHeader.classList.toggle("hidden", !hasVideo);
    }

    // Function to highlight the selected folder in the sidebar
    function setActiveFolder(selectedItem) {
        // Remove the 'active-folder' class from any currently highlighted item
        const previousActive = document.querySelector(".active-folder");
        if (previousActive) {
            previousActive.classList.remove("active-folder");
        }
        // Add the 'active-folder' class to the newly selected item
        selectedItem.classList.add("active-folder");
    }    
});

parentFolderItem.addEventListener("click", () => {
    loadMediaFiles(directoryHandle);
    setActiveFolder(parentFolderItem); // Highlight the parent folder
});

childFolderItem.addEventListener("click", () => {
    loadMediaFiles(entry);
    setActiveFolder(childFolderItem); // Highlight the selected child folder
});


// Function to create media elements (unchanged from previous implementation)
function createMediaElement(type, src, name) {
    const container = document.createElement("div");
    container.classList.add("media-item");

    // Add an image placeholder for audio files
    if (type === "audio") {
        const image = document.createElement("img");
        image.src = "https://cdn-icons-png.flaticon.com/512/4520/4520663.png"; // Placeholder image URL
        image.alt = "Album Cover";
        container.appendChild(image);
    }

    const media = document.createElement(type);
    media.src = src;
    media.controls = true;

    const label = document.createElement("p");
    label.textContent = name;

    const controlsContainer = document.createElement("div");

    const playPauseButton = createControlButton("Play/Pause", () => {
        if (media.paused) {
            media.play();
        } else {
            media.pause();
        }
    });

    const rewindButton = createControlButton("Rewind", () => {
        media.currentTime -= 10;
    });

    const fastForwardButton = createControlButton("Fast Forward", () => {
        media.currentTime += 10;
    });

    const speedControl = createSpeedControl(media); // Add speed control

    let timeDisplay, seekBar;
    if (type === "audio") {
        timeDisplay = document.createElement("p");
        timeDisplay.textContent = "00:00 / 00:00";

        seekBar = document.createElement("input");
        seekBar.type = "range";
        seekBar.min = 0;
        seekBar.max = 100;
        seekBar.value = 0;
        seekBar.addEventListener("input", () => {
            const seekTime = (seekBar.value / 100) * media.duration;
            media.currentTime = seekTime;
        });

        media.addEventListener("timeupdate", () => {
            seekBar.value = (media.currentTime / media.duration) * 100;
            updateTimeDisplay(media, timeDisplay);
        });

        media.addEventListener("loadedmetadata", () => {
            updateTimeDisplay(media, timeDisplay);
        });

        container.appendChild(seekBar);
        container.appendChild(timeDisplay);
    }

    controlsContainer.appendChild(playPauseButton);
    controlsContainer.appendChild(rewindButton);
    controlsContainer.appendChild(fastForwardButton);
    controlsContainer.appendChild(speedControl); // Add speed control to controls container

    container.appendChild(label);
    container.appendChild(media);
    container.appendChild(controlsContainer);

    return container;
}


function createSpeedControl(media) {
    const speedControl = document.createElement("select");
    speedControl.classList.add("speed-control");

    const speeds = [0.5, 1, 1.5, 2]; // Define playback speeds
    speeds.forEach((speed) => {
        const option = document.createElement("option");
        option.value = speed;
        option.textContent = `${speed}x`;
        if (speed === 1) {
            option.selected = true; // Default speed is 1x
        }
        speedControl.appendChild(option);
    });

    speedControl.addEventListener("change", () => {
        media.playbackRate = parseFloat(speedControl.value);
    });

    return speedControl;
}

  
  function createControlButton(label, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }
  
  function updateTimeDisplay(media, displayElement) {
    const currentTime = formatTime(media.currentTime);
    const duration = formatTime(media.duration);
    displayElement.textContent = `${currentTime} / ${duration}`;
  }
  
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  