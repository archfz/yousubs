var socket = new io();
var player;
var currentTrack;

var nextTrackButton = document.getElementById("next_video");
var forwardButton = document.getElementById("forward");
var likeButton = document.getElementById("like");
var idlePause = document.getElementById("idle_pause");
var videoName = document.getElementById("video_name");

var likesContainerScroll = new SimpleBar(document.getElementById("likes"));
var historyContainerScroll = new SimpleBar(document.getElementById("history"));
var channelsContainerScroll = new SimpleBar(document.getElementById("channels"));

var videoHistory = [];
var likes = [];

function onYouTubeIframeAPIReady() {
  player = new YT.Player('video', {
    width: '640',
    height: '390',
    videoId: currentTrack && currentTrack.videoId,
    events: {
      onError: onPlayerError,
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}


function nextYoutubeTrack(track) {
  currentTrack = track;

  if (player) {
    addToHistory(track);
    setYoutubeVideo(track.videoId);
  }
}

function setLikedVideo(videoId) {
  var track = likes.find((l) => l.videoId === videoId);
  currentTrack = track;
  setYoutubeVideo(track.videoId);
}

function setHistoryVideo(videoId) {
  var track = videoHistory.find((l) => l.videoId === videoId);
  currentTrack = track;
  setYoutubeVideo(track.videoId);
}

function setYoutubeVideo(videoId) {
  updateLikeStatus(videoId);
  videoName.innerHTML = "...";

  if (player) {
    player.loadVideoById(videoId);

    var intId = setInterval( function() {
      if (player.getVideoData().title) {
        nextTrackButton.classList.remove("loader");
        clearInterval(intId);
        videoName.innerHTML = player.getVideoData().title;
      }
    });
  }
}

// autoplay video
function onPlayerReady(event) {
  event.target.playVideo();
}

// when video ends
function onPlayerStateChange(event) {
  if (event.data === 0) {
    socket.emit("set next");
  }
}

function onPlayerError(error) {
  if (
    (currentTrack && currentTrack.videoId) &&
    (error.data === 100 ||
    error.data === 101 ||
    error.data === 150)
  ) {
    next(true);
  }
}

function addToHistory(track, save) {
  save = save === undefined ? true : save;
  for (var i = 0; i < videoHistory.length; ++i) {
    if (videoHistory[i].videoId === track.videoId) {
      return;
    }
  }

  videoHistory.push(track);

  var intId = setInterval( function() {
    if ( [ 1, 2, 5 ].indexOf( player.getPlayerState() ) >= 0 ) {
      if (player.getVideoData().title) {
        clearInterval(intId);

        track.title = player.getVideoData().title;
        save && socket.emit("save history", track);
        insertHistory(track);
      }
    }
  }, 100 );
}

function insertHistory(track) {
  var id = videoHistory.length;
  var row = document.createElement("div");
  row.className = "music-item";
  row.innerHTML = "<span>#" + id+ "</span> <a onclick='setHistoryVideo(\"" + track.videoId + "\")'>" + (track.title) + "</a>";
  historyContainerScroll.getContentElement().insertBefore(row, historyContainerScroll.getContentElement().childNodes[0]);
  historyContainerScroll.recalculate();
}

function setMostLikedChannels() {
  var channels = {};
  likes.forEach((like) => {
    if (like.channelUser) {
      if (channels[like.channelUser]) {
        channels[like.channelUser]++
      } else {
        channels[like.channelUser] = 1;
      }
    }
  });

  var element = document.createElement('div');

  Object.entries(channels)
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, count]) => {
      var row = document.createElement("div");
      row.className = "music-item";
      row.innerHTML = "<span>#" + count+ "</span> <a target='_blank' href='https://www.youtube.com/user/" + id + "'>" + (id) + "</a>";
      element.appendChild(row);
    });

  channelsContainerScroll.getContentElement()
    .innerHTML = element.innerHTML;
  channelsContainerScroll.recalculate();
}


function hasLike(track) {
  for (var i = 0; i < likes.length; ++i) {
    if (likes[i].videoId === (typeof track === "string" ? track : track.videoId)) {
      return true;
    }
  }
  return false;
}

function updateLikeStatus(track) {
  if (hasLike(track) && !likeButton.classList.contains("liked")) {
    likeButton.classList.add("liked");
  } else if (!hasLike(track) && likeButton.classList.contains("liked")) {
    likeButton.classList.remove("liked")
  }
}

function addToLike(track, save) {
  save = save === undefined ? true : save;
  if (hasLike(track)) {
    return
  }

  if (!likeButton.classList.contains("loader")) {
    likeButton.classList.add("loader");
  }

  var intId = setInterval( function() {
    if ( [ 1, 2, 5 ].indexOf( player.getPlayerState() ) >= 0 ) {
      if (player.getVideoData().title) {
        track.title = player.getVideoData().title;
        save && socket.emit("save like", track);
        clearInterval(intId);
      }
    }
  }, 100 );
}

function removeLike(track) {
  if (!hasLike(track)) {
    return
  }

  socket.emit("remove like", track);
  for (var i = 0; i < likes.length; ++i) {
    if (likes[i].videoId === track.videoId) {
      break;
    }
  }
  likes.splice(i, 1);
  removeLikeElement(track);
}

function insertLike(track) {
  var id = likes.length;
  var row = document.createElement("div");
  row.id = "like" + track.videoId;
  row.className = "music-item";
  row.innerHTML = "<span>#" + id+ "</span> <a onclick='setLikedVideo(\"" + track.videoId + "\")'>" + (track.title) + "</a>";
  likesContainerScroll.getContentElement().insertBefore(row, likesContainerScroll.getContentElement().childNodes[0]);
  likesContainerScroll.recalculate();

  setMostLikedChannels();
}

function removeLikeElement(track) {
  var element = document.getElementById("like" + track.videoId);
  element.parentNode.removeChild(element);
  updateLikeStatus(track);
  likesContainerScroll.recalculate();

  setMostLikedChannels();
}

function toggleLike() {
  if (hasLike(currentTrack)) {
    removeLike(currentTrack);
  } else {
    addToLike(currentTrack);
  }
}

function forward() {
  if (player) {
    player.seekTo(player.getCurrentTime() + 20);
  }
}

function next(force) {
  if ( force || [ 1, 2, 5 ].indexOf( player.getPlayerState() ) >= 0 ) {
    socket.emit("set next");
  }
}

socket.on("set next", function (track) {
  nextYoutubeTrack(track);
});
socket.on("forward", function () {
  forward();
});
socket.on("like", function () {
  toggleLike();
});
socket.on("pause", function () {
  if (player && idlePause.checked) {
    player.pauseVideo();
  }
});
socket.on("like added", function (track) {
  likes.push(track);
  insertLike(track);
  updateLikeStatus(track);

  if (likeButton.classList.contains("loader")) {
    likeButton.classList.remove("loader");
  }
});
socket.on("loggedout", function () {
  location.reload();
});
socket.on("likes", (likesArr) => {
  likesArr.forEach((like) => likes.push(like) && insertLike(like));
});
socket.on("history", (history) => {
  history.forEach((history) => videoHistory.push(history) && insertHistory(history));
});

nextTrackButton.addEventListener("click", function (event) {
  nextTrackButton.classList.add("loader");
  next();
});

forwardButton.addEventListener("click", function (event) {
  forward();
});

likeButton.addEventListener("click", function (event) {
  toggleLike();
});
