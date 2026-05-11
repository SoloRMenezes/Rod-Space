const player = document.getElementById('player');
const display = document.getElementById('lyric-display');

// STEP 4b: Update these times (in seconds) to match your song!
const lyrics = [
    { time: 2, text: "Welcome to Karaoke!" },
    { time: 5, text: "First line of the song..." },
    { time: 10, text: "Second line of the song..." },
    { time: 15, text: "You're doing great!" }
];

player.addEventListener('timeupdate', () => {
    const currentTime = player.currentTime;
    const activeLyric = lyrics.find((l, i) => {
        return currentTime >= l.time && (!lyrics[i+1] || currentTime < lyrics[i+1].time);
    });

    if (activeLyric) {
        display.innerText = activeLyric.text;
    }
});
