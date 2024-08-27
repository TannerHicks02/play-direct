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
  
    // Load the parent folder
    const parentFolderItem = document.createElement("li");
    parentFolderItem.classList.add("list-group-item");
    parentFolderItem.textContent = directoryHandle.name;
    parentFolderItem.addEventListener("click", () =>
      loadMediaFiles(directoryHandle)
    );
    sidebar.appendChild(parentFolderItem);
  
    // Load child folders
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "directory") {
        const childFolderItem = document.createElement("li");
        childFolderItem.classList.add("list-group-item");
        childFolderItem.textContent = entry.name;
        childFolderItem.addEventListener("click", () => loadMediaFiles(entry));
        sidebar.appendChild(childFolderItem);
      }
    }
  
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
  
      if (hasAudio) {
        audioHeader.classList.remove("hidden");
      } else {
        audioHeader.classList.add("hidden");
      }
  
      if (hasVideo) {
        videoHeader.classList.remove("hidden");
      } else {
        videoHeader.classList.add("hidden");
      }
    }
  });
  
  async function loadMediaFiles(folderHandle) {
    const sidebar = document.getElementById("sidebar");
    const header = document.getElementById("sidebar-header");
    const listGroup = document.getElementById("sidebar-list-group");
    const parentFolderName = folderHandle.name;
  
    // Update sidebar header with the parent folder name
    header.textContent = parentFolderName;
  
    // Clear existing child folder list
    listGroup.innerHTML = "";
  
    for await (const entry of folderHandle.values()) {
      if (entry.kind === "directory") {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.textContent = entry.name;
        listItem.addEventListener("click", async () => {
          await loadMediaFiles(entry);
        });
        listGroup.appendChild(listItem);
      }
    }
  
    // Display the sidebar
    sidebar.style.display = "block";
  
    // Clear existing media files
    const audioRow = document.getElementById("audioRow");
    const videoRow = document.getElementById("videoRow");
    audioRow.innerHTML = "";
    videoRow.innerHTML = "";
  
    for await (const entry of folderHandle.values()) {
      if (entry.kind === "file") {
        const file = await entry.getFile();
        const url = URL.createObjectURL(file);
  
        if (file.type.startsWith("audio/")) {
          const audioElement = createMediaElement("audio", url, file.name);
          audioRow.appendChild(audioElement);
        } else if (file.type.startsWith("video/")) {
          const videoElement = createMediaElement("video", url, file.name);
          videoRow.appendChild(videoElement);
        }
      }
    }
  }
  
  function createMediaElement(type, src, name) {
    const container = document.createElement("div");
    container.classList.add("media-container");
  
    const mediaElement = document.createElement(type);
    mediaElement.src = src;
    mediaElement.controls = true;
  
    const label = document.createElement("p");
    label.textContent = name;
  
    container.appendChild(mediaElement);
    container.appendChild(label);
  
    return container;
  }
  
  function createMediaElement(type, src, name) {
    const container = document.createElement("div");
    container.classList.add("media-item");
  
    // Add an image placeholder for audio files
    if (type === "audio") {
      const image = document.createElement("img");
      image.src =
        "https://cdn-icons-png.flaticon.com/512/4520/4520663.png"; // Placeholder image URL
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
  
    container.appendChild(label);
    container.appendChild(media);
    container.appendChild(controlsContainer);
  
    return container;
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
  