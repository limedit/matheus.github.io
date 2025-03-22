var progressArea = $(".song-progress");
var durationArea = $(".song-duration");
var hours = 0,
    minutes = 0,
    seconds = 0,
    timestamp,
    progress,
    time,
    date,
    hiddenSpotify = 0;

updateSpotify();

setInterval(() => {
    timestamp = getTimestamp(progressArea.text());
    if (timestamp > 3600)
        time = new Date(timestamp * 1000).toISOString().substr(11, 8);
    else time = new Date(timestamp * 1000).toISOString().substr(14, 5);

    if (progressArea.text() != durationArea.text()) {
        progressArea.text(time);
        $(".song-range").attr("value", timestamp);
    } else {
        updateSpotify();
    }
}, 1000);

function getTimestamp(date) {
    date = date.split(":");
    if (date.length > 2) {
        hours = date[0];
        minutes = date[1];
        seconds = date[2];
    } else if (date.length > 1) {
        minutes = date[0];
        seconds = date[1];
    } else {
        seconds = date[0];
    }
    return (
        parseInt(hours * 3600) + parseInt(minutes * 60) + parseInt(seconds) + 1
    );
}

function updateSpotify() {
    $.ajax({
        url: "/post-spotify.php",
        type: "POST",
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        success: function(result) {
            fillSpotifyArea(result);
        },
        error: function(jqXHR, exception) {
            var msg = "";
            if (jqXHR.status === 0) {
                msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status == 404) {
                msg = "Requested page not found. [404]";
            } else if (jqXHR.status == 500) {
                msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
                msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
                msg = "Time out error.";
            } else if (exception === "abort") {
                msg = "Ajax request aborted.";
            } else {
                msg = "Uncaught Error.\n" + jqXHR.responseText;
            }
            console.log(msg);
        },
    });
}

function fillSpotifyArea(json) {
    if (json == "") return;
    if (json.artist == "" || json.isPlaying == false || json.artist == null) return;
    if (hiddenSpotify == 1 && (json.artist != null || json.artist != null)) $(".spotify-area").show();

    $(".song-image").attr("src", json.image);
    $(".song-name").text(json.name);
    $(".song-author").text(json.artist);
    $(".song-progress").text(json.progress);
    $(".song-duration").text(json.duration);
    $(".song-range").attr("value", getTimestamp(json.progress));
    $(".song-range").attr("max", getTimestamp(json.duration));
}

setInterval(() => {
    updateSpotify();
}, 5000);