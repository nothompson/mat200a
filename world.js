class platform {
  constructor(x,y,w,h, randomR, randomG, randomB){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.area = w * h;
    this.randomR = randomR;
    this.randomG = randomG;
    this.randomB = randomB;
  }
  display(){
  strokeWeight(5);
  stroke(0);
  fill(this.randomR, this.randomG, this.randomB, 220);
  rect(this.x,this.y,this.w,this.h);

  }
}

class colorHandler{
  constructor(r = 255,g = 255,b = 255, bgState){
    this.r = r;
    this.g = g;
    this.b = b;
    this.state = bgState;
  }
  update(bgState){
    this.state = bgState
  }
  randomize(){
    //flood
    if(this.state <= 0.25){
      this.r = random(0, 50);
      this.g = random(50,100);
      this.b = random(120,220);
    }
    //pot
    else if (this.state >= 0.25 && this.state <= 0.5){
      this.r = random(140, 255);
      this.g = random(30,180);
      this.b = random(20,40);
    }
    //manic
    else if (this.state >= 0.5 && this.state <= 0.75){
      this.r = random(10, 255);
      this.g = random(50,100);
      this.b = random(80,220);
    }
    //flowers
    else if (this.state >= 0.75 && this.state <= 1.0){
      this.r = random(0, 90);
      this.g = random(70,180);
      this.b = random(0,50);
  }
  }
}

class door{
    constructor(x,y,w,h, isEntrance = false){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.area = w * h;
        this.isEntrance = isEntrance;

        this.isExit = false;
        if(!isEntrance){
            this.isExit = true;
        }
    }
    
    display(ent, ext){
    // strokeWeight(5);
    // stroke(0);
    if(this.isEntrance){
      image(ent, this.x, this.y - this.h/2, this.w, this.h);
    }else if(!this.isEntrance){
      image(ext, this.x, this.y - this.h/2, this.w, this.h);
    }
    // rect(this.x,this.y,this.w,this.h);
    }
}

class worldPoint{
  constructor(x,y,n){
    this.x = x;
    this.y = y;
    this.n = n;
  }
}

class healthPickup{
  constructor(x,y){
  this.x = x;
  this.y = y;
  this.radius = 50;
  this.position = createVector(this.x,this.y);
  this.pickedUp = false;
  }
  display(img){
    // stroke(0);
    // strokeWeight(3);
    // fill(255,193,200 );
    // circle(this.x,this.y,this.radius);
    image(img, this.x - this.radius /2 , this.y - this.radius / 2, this.radius, this.radius)
  }
  picked(){
    this.pickedUp = true;
  }
}

class potOfGreed{
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.radius = 80;
    this.position = createVector(this.x,this.y);
    this.accepted = false;
    this.prompted = false;

    this.gluttony = false;
    this.warfare = false;
    this.glass = false;
    
    this.vitality = false;
    this.mending = false;
    this.blight = false;
    this.grace = false;
    this.flight = false;
    this.slug = false;

  }
    display(img){
    // stroke(0);
    // strokeWeight(3);
    // fill(0,255,0);
    // circle(this.x,this.y,this.radius);
    image(img, this.x - this.radius/ 2 ,this.y - this.radius / 2,this.radius,this.radius);

  }

  acceptBoon(){
    this.accepted = true;
  }

  prompt(){
    textSize(20);
    fill(255);
    stroke(0);
    strokeWeight(2);
    if(this.y < myY + 50){
    text("Accept the Pot's deal?", this.x, this.y + 60);
    }
    else{
      text("Accept the Pot's deal?", this.x, this.y - 50);
    }
  }

    applyBoon(blob){
    let randomChance = random(0.0, 2.25);
    if(randomChance >= 0 && randomChance <= 0.25 && blob.speedBoost > -15){
      blob.maxHP += 50;
      blob.jumpBoost += -15;
      blob.speedBoost += -3;
      if(blob.HP < blob.maxHP){
        blob.regen(50);
      }
      this.gluttony = true;

    }
    if(randomChance > 0.25 && randomChance <= 0.5 && blob.graceBoost > -75){
      blob.attackBoost += 15;
      blob.graceBoost += -15;
      this.warfare = true;
    }
    if(randomChance > 0.5 && randomChance <= 0.75 && blob.maxHP > 50){
      blob.jumpBoost += 100;
      blob.maxHP -= 50;
      blob.speedBoost += 5;
      if(blob.HP > 50){
        blob.degen(50);
      }
      this.glass = true;
    }
    if(randomChance > 0.75 && randomChance <= 1.0 && blob.HP < blob.maxHP){
     blob.regen(50);
     this.mending = true;
    }
    if(randomChance > 1.0 && randomChance <= 1.25 && blob.HP > 25){
     blob.degen(25);
     this.blight = true;
    }
    if(randomChance > 1.25 && randomChance <= 1.5){
      blob.maxHP += 25;
      blob.regen(25);
      this.vitality = true;
    }
    if(randomChance > 1.5 && randomChance <= 1.75){
      blob.graceBoost += 30;
      this.grace = true;
    }
    if(randomChance > 1.75 && randomChance <= 2.0){
      blob.jumpBoost += 50;
      this.flight = true;

    }
    if(randomChance > 2.0 && randomChance <= 2.25){
      blob.jumpBoost += -25;
      blob.speedBoost += -1;
      this.slug = true;
    }

  }
}

function potPlacement(pots, validGaps, init){
  // let randomChance = random(0.0,1.0);
  let randomChance = init;
  if(randomChance >= init){
    if(validGaps.length > 0){
    let chosen = random(validGaps);
    pots.push(new potOfGreed(chosen.x, chosen.y));

    let index = validGaps.indexOf(chosen);
    if (index !== -1) validGaps.splice(index, 1);
    }
  }
}

function healthPickupPlacement(healthPickups, validGaps, init, two, three){
    let amount = 0;
    let randomChance = random(0.0,1.0);
    if(randomChance >= init){
      amount++;
    }
    if(randomChance >= two){
      amount++;
    }
    if(randomChance >= three){
      amount++;
    }
      for(let i = 0; i < amount; i++){
        if(validGaps.length > 0){
        let chosen = random(validGaps);
        healthPickups.push(new healthPickup(chosen.x, chosen.y));

        let index = validGaps.indexOf(chosen);
        if (index !== -1) validGaps.splice(index, 1);
        }
      }

      
}

function generateNoiseGrid(noiseGrid, gap, offset, xScale, yScale) {
  for (let x = myX + gap / 2; x < myWidth + myX; x += gap) {
    for (let y = myY * 1.5 + gap / 2; y < myHeight + myY; y += gap) {
      let n = noise((x) * xScale, (y) * yScale);
      noiseGrid.push(new worldPoint (x, y, n ));
    }
  }
}

function aabbOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2);
}

function platformPlacement(scaledW, scaledH, randLow, randHigh, colorHandler){
    for(let g of noiseGrid){
        if(g.n >= 0.575){
        colorHandler.randomize();
        platforms.push(new platform(g.x - 20, g.y - 5, scaledW * g.n * random(randLow,randHigh),scaledH * g.n * random(randLow,randHigh), colorHandler.r, colorHandler.g, colorHandler.b));
        }
        if(g.n <= 0.525 && g.n >= 0.5){
        colorHandler.randomize();
        platforms.push(new platform(g.x - 20, g.y - 5, scaledW * g.n * random(randLow,randHigh),scaledH * g.n * random(randLow,randHigh), colorHandler.r, colorHandler.g, colorHandler.b));
        }
        }
}

function gapCheck(rowThreshold, groupedByRow, validGaps, clearWidth, clearHeight, gapThreshold, doors) {
    for (let p of platforms) {
    let placed = false;
    for (let row of groupedByRow) {
      if (abs(row[0].y - p.y) < rowThreshold) {
        row.push(p);
        placed = true;
        break;
      }
    }
    if (!placed) groupedByRow.push([p]);
  }


  for (let row of groupedByRow) {
    row.sort((a, b) => a.x - b.x);

    for (let i = 0; i < row.length - 1; i++) {
      let current = row[i];
      let next = row[i + 1];

      let gapStart = current.x + current.w;
      let gapEnd = next.x;
      let gapWidth = gapEnd - gapStart;

      if (gapWidth > gapThreshold) {
        let clearX = gapStart + (gapWidth / 2) - clearWidth / 2;
        let clearY = current.y - 20;

        let fits = true;
        for (let other of platforms) {
          for (let other2 of doors) {
            for (let other3 of gloobis) {
            if (
              aabbOverlap(clearX, clearY, clearWidth, clearHeight, other.x, other.y, other.w, other.h) ||
              aabbOverlap(clearX, clearY, clearWidth, clearHeight, other2.x, other2.y, other2.w, other2.h) ||
              aabbOverlap(clearX, clearY, clearWidth, clearHeight, other3.x, other3.y, other3.radius, other3.radius)
            ) {
              fits = false;
              break;
              }
            }
          }
        }

        if (fits) {
        // Final check to ensure gap doesn't overlap *any* platform
          let safe = true;
          for (let plat of platforms) {
            if (aabbOverlap(clearX, clearY, clearWidth, clearHeight, plat.x, plat.y, plat.w, plat.h)) {
              safe = false;
              break;
            }
         }
        if (safe) validGaps.push({ x: clearX, y: clearY });
        }
      }
    }
  }
}

function doorPlacement(validGaps, xMin, xMax) {
  let sideGaps = validGaps.filter(v => v.x >= xMin && v.x <= xMax);
  if (sideGaps.length > 0) {
    let chosen = random(sideGaps);
    console.log("door at:", chosen.x, chosen.y);

    let index = validGaps.indexOf(chosen);
    if (index !== -1) validGaps.splice(index, 1);

    return chosen;
  }
  else{
    let randomPlace = createVector(random(myX, myWidth), random(myY, myHeight))
    return randomPlace;
  }
}


function gloobisPlacement(gloobis, validGaps, low, high) {
    let randomNum = random(low, high);
      for(let i = 0; i < randomNum; i++){
        if(validGaps.length > 0){
        let chosen = random(validGaps);
        // console.log("gloobis at: ", chosen.x, chosen.y);
        gloobis.push(new creature(chosen.x, chosen.y));
        }

      }
}

class level{
    constructor(backgroundIndex, entranceIndex, exitIndex){
        this.chosenSpots = [];
        this.entrance = 0;
        this.doors = [];
        this.bg = backgroundIndex;
        this.validGaps = [];

        this.entranceIndex = entranceIndex;
        this.exitIndex = exitIndex;
        this.stage = 0;

        this.textToShow = "";
        this.textTimer = 0;
    } 
    generateLevel(colorHandler){

      this.stage++;
      this.bg = random(0,1);
      colorHandler.update(this.bg); 

        gloobis = [];
        noiseGrid = [];
        platforms = [];
        healthPickups = [];
        pots = [];

        let rowThreshold = 20;
        let groupedByRow = [];
        // let validGaps = [];
        let clearWidth = 50;
        let clearHeight = 95;
        let clearBuffer = 10; 
        let gapThreshold = clearWidth + clearBuffer;

        xScale = (myWidth + myX) / 50;
        yScale = (myHeight + myY) / 50;
    
        gap = (myWidth + myX) * random(0.05, 0.035);
        offset = 0.0;

    this.validGaps.length = 0;
    pots.length = 0;

    generateNoiseGrid(noiseGrid, gap, offset, xScale, yScale);


    scaledW = ((myWidth + myX) * 0.025) + gap + 10;
    scaledH = ((myHeight + myY) * 0.025) + gap + 10;

    console.log("width: " + scaledW, "height: " + scaledH);
    console.log("gap: " + gap);

    let randLow = 0.25;
    let randHigh = 2.0;
    
    platformPlacement(scaledW, scaledH, randLow, randHigh, colorHandler);

    platforms.sort((a, b) => a.y - b.y || a.x - b.x);

    gapCheck(rowThreshold, groupedByRow, this.validGaps, clearWidth, clearHeight, gapThreshold, this.doors);

    let leftThreshold = clearWidth * 10;
    let rightThreshold = myWidth + myX - clearWidth * 10;

    this.entrance = random(0,1);

    //   let chosenSpots = [];

    this.entranceIndex = random() < 0.5 ? 0 : 1;
    this.exitIndex = 1 - this.entranceIndex;

    if (this.validGaps.length >= 0) {

      let leftDoor = doorPlacement(this.validGaps, myX, leftThreshold);
      let rightDoor = doorPlacement(this.validGaps, rightThreshold, myWidth);

      if (leftDoor && rightDoor) {
        this.chosenSpots = [leftDoor, rightDoor];

        this.doors.length = 0;

        this.doors.push(new door(this.chosenSpots[0].x, this.chosenSpots[0].y, clearWidth, clearHeight, this.entranceIndex === 0));
        this.doors.push(new door(this.chosenSpots[1].x, this.chosenSpots[1].y, clearWidth, clearHeight, this.entranceIndex === 1));

      } else if (leftDoor || rightDoor) {
        // Fallback in case only one valid side
        let solo = leftDoor || rightDoor;
        entranceIndex = 0;
        exitIndex = -1; // No exit
        this.chosenSpots = [solo];
        this.doors.push(new door(solo.x, solo.y, clearWidth, clearHeight, true));
      }
      else if(!leftDoor && !rightDoor) {
        console.warn("No valid doors found. Retrying level generation...");
        this.generateLevel(colorHandler); // careful to avoid infinite loops!
        return;
      }

      let initThresholdHealth = 0;
      let secondHealth = 0;
      let thirdHealth = 0;
      let gloobLow = 0;
      let gloobHigh = 0;
      let potChance = 0;

      if(bgString(this.bg) == "Melting Glacier"){
        initThresholdHealth = 0.3;
        secondHealth = 0.7;
        thirdHealth = 0.99;
        gloobLow = 1;
        gloobHigh = 8;
        potChance = 0.95;
      }
       else if(bgString(this.bg) == "Cursed Fleshscape"){
        initThresholdHealth = 0.5;
        secondHealth = 0.9;
        thirdHealth = 2;
        gloobLow = 8;
        gloobHigh = 22;
        potChance = 0.66;
      }
       else if(bgString(this.bg) == "Fungal Sun Palace"){
        initThresholdHealth = 0.25;
        secondHealth = 0.6;
        thirdHealth = 0.9;
        gloobLow = 5;
        gloobHigh = 10;
        potChance = 0.8;
      }
       else if(bgString(this.bg) == "Blooming Garden"){
        initThresholdHealth = 0.05;
        secondHealth = 0.25;
        thirdHealth = 0.75;
        gloobLow = 0;
        gloobHigh = 6;
        potChance = 2.0;
      }

      gloobisPlacement(gloobis, this.validGaps, gloobLow,gloobHigh);
      healthPickupPlacement(healthPickups, this.validGaps, initThresholdHealth, secondHealth, thirdHealth);
      potPlacement(pots, this.validGaps, potChance)
      }
    } 

    hasEntered(blob){
      if(blob.entered){
          blob.gracePeriod = true;
          console.log("here")
        }
    }

    positionBlob(blob){
           // Spawn blob at entrance
          if (this.doors.length <= this.entranceIndex || !this.doors[this.entranceIndex]) {
            blob.setPosition(random(myX, myWidth + myX),random(myY, myHeight));
            blob.entered = true;
            blob.exited = false;
            this.hasEntered(blob);
          }
          else{
            blob.setPosition(this.doors[this.entranceIndex].x, this.doors[this.entranceIndex].y);
            blob.entered = true;
            blob.exited = false;
            this.hasEntered(blob);
            }
    }
    displayBG(){
      displayBackgrounds(this.bg)
    }

    // this.gluttony = false;
    // this.warfare = false;
    // this.glass = false;
    displayUI(editMode, pots){
      textSize(20);
      fill(255);
      stroke(0);
      strokeWeight(2);
      text(`Level ${this.stage}: ${bgString(this.bg)}`, myWidth + myX - 120, 30);
      if(editMode){
        for(let g of this.validGaps){
          showSpots(g.x, g.y)
          }
        }

      for (let p of pots) {
        if (p.vitality) {
            this.textToShow = "Accepted Gift of Vitality";
            this.textTimer = 120;
          }
          p.vitality = false;
        if (p.slug) {
            this.textToShow = "Accepted Curse of The Slug";
            this.textTimer = 120;
          }
          p.slug = false;
        if (p.flight) {
            this.textToShow = "Accepted Gift of Buoyancy";
            this.textTimer = 120;
          }
          p.flight = false;
        if (p.grace) {
            this.textToShow = "Accepted Gift of Warding";
            this.textTimer = 120;
          }
          p.grace = false;
        if (p.blight) {
            this.textToShow = "Accepted Curse of Atrophy";
            this.textTimer = 120;
          }
          p.blight = false;
        if (p.mending) {
            this.textToShow = "Accepted Gift of Mending";
            this.textTimer = 120;
          }
          p.mending = false;
        if (p.glass) {
            this.textToShow = "Accepted Boon of Glass";
            this.textTimer = 120;
          }
          p.glass = false;
        if (p.warfare) {
            this.textToShow = "Accepted Boon of Warfare";
            this.textTimer = 120;
          }
          p.warefare = false;
        if (p.gluttony) {
            this.textToShow = "Accepted Boon of Gluttony";
            this.textTimer = 120;
          }
          p.gluttony = false;
        }

        this.textUpdates();
    }

textUpdates() {
  if (this.textTimer > 0) {
    textAlign(CENTER);
    textSize(50);
    fill(255);
    stroke(0);
    strokeWeight(2);
    text(this.textToShow, myWidth / 2 +myX, myHeight / 2 + myY);
    this.textTimer--;
  }
}
  //end of level class
}


function showSpots(x,y){
    noStroke()
    fill(255,0,0);
    circle(x,y, 30)
}

function bgString(value){
  //flood
    if(value <= 0.25){
    return "Melting Glacier"
    }
    //pot
    else if (value >= 0.25 && value <= 0.5){
      return "Cursed Fleshscape"
    }
    //manic
    else if (value >= 0.5 && value <= 0.75){
      return "Fungal Sun Palace"
    }
    //flowers
    else if (value >= 0.75 && value <= 1.0){
      return "Blooming Garden"
  }
}

function editBorder(){
  noStroke();
  fill(255,0,0);
  rect(myX,myY,20,myHeight);
  rect(myWidth + myX - 20,myY,20,myHeight);
  rect(myX,myY,myWidth,20)
  rect(myX,myHeight + myY- 20,myWidth,20)
    
  
  cursor('grab');
  
}

function deathScreen(){
    textSize(50);
    fill(255);
    stroke(0);
    strokeWeight(2);
    text("slimed out!", myWidth / 2 +myX, myHeight / 2 + myY);
    fill(200,90,130);
    text("press any key to continue", myWidth / 2 +myX, myHeight / 2 + myY + 50);
}