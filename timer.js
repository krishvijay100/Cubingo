const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const timeDisplay = document.getElementById("timeDisplay");

let startTime = 0;
let elapsedTime = 0;
let currentTime = 0;
let mins = 0;
let secs = 0;
let milisecs = 0;
let intervalId;

document.addEventListener("keyup", (event) => {
    if (event.code === "Space")
    {
        startTime = Date.now() - elapsedTime;
        //returns an ID number that represents the running interval loop.
        //This is used in the stop function, so that the browser knows which interval to cancel when stop is clicked
        intervalId = setInterval(updateTime, 75);
    }
});   

document.addEventListener("keydown", (event) => {
    if (event.code === "Enter")
    {
        clearInterval(intervalId);
    }   
});

function updateTime(){
    elapsedTime = Date.now() - startTime;
    milisecs = Math.floor(elapsedTime % 60);
    secs = Math.floor((elapsedTime/1000) % 60);
    mins = Math.floor((elapsedTime/(1000*60)) % 60);
    
    //uses padStart() function to use zeros as placeholders until both digits have been reached by the timer
    milisecs = String(milisecs).padStart(2,"0");
    secs = String(secs).padStart(2,"0");
    mins = String(mins).padStart(2,"0");

    timeDisplay.textContent = `${mins}:${secs}:${milisecs}`;
}