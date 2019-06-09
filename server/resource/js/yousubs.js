var socket = new io();
var player;
var currentTrack;

var historyContainer;
var likesContainer;

var nextTrackButton = document.getElementById("next_video");
var forwardButton = document.getElementById("forward");
var likeButton = document.getElementById("like");
var idlePause = document.getElementById("idle_pause");
var videoName = document.getElementById("video_name");

likesContainer = document.getElementById("likes");
historyContainer = document.getElementById("history");

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


function setYoutubeTrack(track) {
  currentTrack = track;
  videoName.innerHTML = "...";

  updateLikeStatus(track);

  if (player) {
    addToHistory(currentTrack);
    setYoutubeVideo(track.videoId);
  }
}

function setYoutubeVideo(videoId) {
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
  row.innerHTML = "<span>#" + id+ "</span> <a onclick='setYoutubeVideo(\"" + track.videoId + "\")'>" + (track.title) + "</a>";
  historyContainer.insertBefore(row, historyContainer.childNodes[0]);
}

function hasLike(track) {
  for (var i = 0; i < likes.length; ++i) {
    if (likes[i].videoId === track.videoId) {
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
  likes.push(track);
  var id = likes.length;

  var intId = setInterval( function() {
    if ( [ 1, 2, 5 ].indexOf( player.getPlayerState() ) >= 0 ) {
      if (player.getVideoData().title) {
        track.title = player.getVideoData().title;
        save && socket.emit("save like", track);
        clearInterval(intId);
        insertLike(track);
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
  row.innerHTML = "<span>#" + id+ "</span> <a onclick='setYoutubeVideo(\"" + track.videoId + "\")'>" + (track.title) + "</a>";
  likesContainer.insertBefore(row, likesContainer.childNodes[0]);
  updateLikeStatus(track);
}

function removeLikeElement(track) {
  var element = document.getElementById("like" + track.videoId);
  element.parentNode.removeChild(element);
  updateLikeStatus(track);
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
  setYoutubeTrack(track);
});
socket.on("forward", function () {
  forward();
});
socket.on("like", function () {
  addToLike(currentTrack);
});
socket.on("pause", function () {
  if (player && idlePause.checked) {
    player.pauseVideo();
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
  if (hasLike(currentTrack)) {
    removeLike(currentTrack);
  } else {
    addToLike(currentTrack);
  }
});
