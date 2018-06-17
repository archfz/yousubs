var socket = new io();

function setYoutubeVideo(track) {
  var videoElement = document.getElementById("video");
  videoElement.innerHTML = "<iframe id=\"player\" type=\"text/html\" width=\"640\" height=\"390\"" +
    " src=\"http://www.youtube.com/embed/" + track.videoId + "?autoplay=1\"" +
    " frameborder=\"0\"></iframe>"
}

socket.on("set next", function (track) {
  setYoutubeVideo(track);
});

window.addEventListener("load", function () {
  var nextTrackButton = document.getElementById("next_video");

  nextTrackButton.addEventListener("click", function (event) {
    socket.emit("set next");
  });
});
