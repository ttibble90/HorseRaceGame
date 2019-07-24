/**
 * Created by tomdt on 6/23/2017.
 */

let cyclesRemaining = 1000;


const horse_array = [
    {img: "./resources/horse_images/final/stonewall_000.png", name: "Stonewall"},
    {img: "./resources/horse_images/final/DEMON_HORZE_666.png", name: "DEMON HORZE"},
    {img: "./resources/horse_images/final/CrotchRocket_93_raw.png", name: "CROTCH ROCKET"},
    {img: "./resources/horse_images/final/BlackJack_10.png", name: "BlackJack"}
];


const GAME_CANVAS = document.getElementById("gamecanvas");
const BG_CANVAS = document.getElementById("bgcanvas");

const BG_CTX = BG_CANVAS.getContext("2d");
const CTX = GAME_CANVAS.getContext("2d");

const COUNTDOWN_START_SECS = 10;

// Size parameters, they will be adjusted to fit the size of the screen
let WIDTH = GAME_CANVAS.width;
let HEIGHT = GAME_CANVAS.height;

let horseWidth = WIDTH / 8;
let horseHeight = WIDTH / 8;

// state tracking
let gameState = "preRace";  // this should probably be an enum later
const horses = [];
const finalPlaces = [];
let finishLineScan = 0;


// sound effect triggers

const soundEffectTriggers = [Math.floor(Math.random() * (100)) + 700, // should be between 700 and 800
Math.floor(Math.random() * (100)) + 300, // shuld be between 300 and 400
//  Math.floor(Math.random() * (100)) + 200, //between 200 - 300
];


//Start game loop
window.onload = ( ) => {
     //  initBackground();


    initHorses();

    // The game loop should be a setInterval that way the screen size can be adjusted.
    // I think its a bit easier to keep track of the state from one loop  vs function callbacks
    setInterval(gameLoop, 20); //  a touch <60 FPS

};

function gameLoop(){

    switch(gameState){
        case "preRace":
            if (horses.length === 4){
                gameState = 'countdownStart';
                console.log ("Horses loaded, transitioning to countdown");
            }
            break;
        case "countdownStart":
                startCountdown(COUNTDOWN_START_SECS,BG_CTX);
            break;
        case "running":
            screenReset();
            runRace(CTX,BG_CTX);
            break;
        case "finishing":
            screenReset();
            runRace(CTX,BG_CTX);
            break;
        default:
            break;
    }
}

function runRace(ctx,bg_ctx){

    cyclesRemaining --;

    //handle race background
    drawRaceBackground(bg_ctx, WIDTH, HEIGHT, horseHeight, cyclesRemaining, true);


    //Figure out horse postitions
    const x = WIDTH / 2;
    const y = HEIGHT / 2;

    const lane_1_height = HEIGHT - (horseHeight * 1.25);
    //todo- change these sway varibles to be "trot" objects, or something, at put it in a horse object, so we can reuse these better
    // horse 1 & 2 are hilarious, horse 3&4 are more normal paced
    const horse_1_sway = Math.sin(cyclesRemaining) * 10;


    const lane_2_height = HEIGHT - (horseHeight * 1.75);
    const horse_2_sway = Math.cos(cyclesRemaining) * 10;


    const lane_3_height = HEIGHT - (horseHeight * 2.25);
    const horse_3_sway = Math.sin(cyclesRemaining/2) * 10;


    const lane_4_height = HEIGHT - (horseHeight * 2.75);
    const horse_4_sway = Math.cos(cyclesRemaining/2) * 10;



    updateHorsePositions();

    checkForSoundEffects(cyclesRemaining);


    //draw shadows under horses

    // ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle [, anticlockwise]);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(
        horses[3].x + (horseWidth /2) , // center of horses position
        HEIGHT - (horseHeight * 1.75),// center of lane
        (horseWidth * .75) / 2,
        (horseHeight * .25) / 2,
        0, 0, Math.PI *2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
        horses[2].x + (horseWidth /2) , // center of horses position
        HEIGHT - (horseHeight * 1.25),// center of lane
        (horseWidth * .75) / 2,
        (horseHeight * .25) / 2,
        0, 0, Math.PI *2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
        horses[1].x + (horseWidth /2) , // center of horses position
        HEIGHT - (horseHeight * .75),// center of lane
        (horseWidth * .75) / 2,
        (horseHeight * .25) / 2,
        0, 0, Math.PI *2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
        horses[0].x + (horseWidth /2) , // center of horses position
        HEIGHT - (horseHeight * .25),// center of lane
        (horseWidth * .75) / 2,
        (horseHeight * .25) / 2,
        0, 0, Math.PI *2);
    ctx.fill();




    // draw horses
    ctx.drawImage(horses[3].image, horses[3].x , (lane_4_height + horse_4_sway) , horseWidth, horseHeight);
    ctx.drawImage(horses[2].image, horses[2].x , (lane_3_height + horse_3_sway) , horseWidth, horseHeight);
    ctx.drawImage(horses[1].image, horses[1].x , (lane_2_height + horse_2_sway) , horseWidth, horseHeight);
    ctx.drawImage(horses[0].image, horses[0].x , (lane_1_height + horse_1_sway) , horseWidth, horseHeight);

    if (cyclesRemaining <= 0 ){
        if (gameState === 'running'){
            console.log("checking for winners now");
            finishLineScan = WIDTH - horseWidth;
            gameState = "finishing";
        }

        let foundHorseIndex = null;

        console.log(finishLineScan);

        for (let i = 0; i < horses.length; i++) {
            //horse has finished
            if (horses[i].x >= finishLineScan && horses[i].place === null){
              if (!foundHorseIndex || horses[foundHorseIndex].x < horses[i].x) {
                  foundHorseIndex = i;
              }
            }
        }
        if(foundHorseIndex != null){
            finalPlaces.push(horses[foundHorseIndex]);
            horses[foundHorseIndex].place = 1;
            console.log("Horse Finished - " + foundHorseIndex);
        }
       // horses.splice(foundHorseIndex);
        if (finalPlaces.length === 4){
            gameState = "finished";
            stopGallop();
        }
        finishLineScan -= finishLineSpeed;
    }
}


function initHorses() {
    console.log("initHorses");
    for (let i =0; i < 4; i ++ ){
        const horse_image = new Image();
        horse_image.src = horse_array[i].img; // todo - change to grab random horse
        const tempName = horse_array[i].name; //
        horse_image.onload = function() {
            const horse = {
                image: horse_image,
                name: tempName,
                x:0,
                y:0,
                currentSpeed: null,
                currentDestination:null,
                place: null,
                changePositionCycles:[
                    Math.floor(Math.random() * (100)) + 700, // should be between 700 and 800
                    Math.floor(Math.random() * (100)) + 450, // shuld be between 450 and 550
                    Math.floor(Math.random() * (100)) + 200, //between 200 - 300
                ]

            };
            horses.push(horse);
        }
    }

}

function screenReset(){
        HEIGHT = GAME_CANVAS.height = BG_CANVAS.height = window.innerHeight;
        WIDTH = GAME_CANVAS.width = BG_CANVAS.width = window.innerWidth;
        horseWidth = horseHeight = WIDTH / 8;
}


function startCountdown(seconds, bg_ctx){
    playCountdownAudio(seconds);
    if (gameState === "countdownStart" ) {
        gameState = "countdownRunning";
    }
    console.log ("Coundown: " + seconds);

    if (seconds > 0) {
        screenReset();
        drawCountdown(bg_ctx, WIDTH, HEIGHT, horseHeight, seconds, horses);
        setTimeout (()=>{startCountdown( seconds - 1, bg_ctx)}, 1000);
    }
    else {
        gameState = "running";
    }
}


function updateHorsePositions(){

    for (let i = 0; i < horses.length; i++) {
        const horse = horses[i];

        // update to current destination
        if (horse.currentDestination === null){
            horse.currentDestination = Math.floor(Math.random() * (WIDTH - horseWidth));
        }

        if (horse.currentSpeed === null){
           horse.currentSpeed=  Math.floor(Math.random() * 5) + 3;
        }

        if (horse.x > horse.currentDestination + 5 ){
            horse.x -= horse.currentSpeed / 2;
        }
        else if (horse.x < horse.currentDestination - 5){
            horse.x += horse.currentSpeed;
        }

        //add x sway
        horse.x += swayPatternFunctions[i].x(cyclesRemaining);

        // blow away destination if horse has hit its reset point
        for (let i =0; i < horse.changePositionCycles.length; i ++){
            if (cyclesRemaining === horse.changePositionCycles[i]){
                horse.currentDestination = null;
                horse.currentSpeed = null;
            }
        }

        //last second reset for giggles!
        if(cyclesRemaining === 50 ){
            horse.currentDestination = null;
            horse.currentSpeed = null;
        }
    }

}

function checkForSoundEffects(cycle){
    for (let i = 0; i < soundEffectTriggers.length; i++) {
            if (cycle === soundEffectTriggers[i]){
                playRandomNeigh();
            }
    }
}

swayPatternFunctions = [
    {x:(cycle)=>{ return Math.cos(cycle/3) * 10;}, y:(cycle)=>{return Math.sin(cycle) * 10} },
    {x:(cycle)=>{ return Math.sin(cycle/3) * 10;}, y:(cycle)=>{ return Math.cos(cycle) * 10;}},
    {x:(cycle)=>{ return Math.cos(cycle/4) * 10;}, y:(cycle)=>{ return Math.sin(cycle/2) * 10}},
    {x:(cycle)=>{ return Math.sin(cycle/4) * 10;}, y:(cycle)=>{ return Math.cos(cycle/2) * 10}}
    ];