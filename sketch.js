let carImg, tireImg, fenceImg, roadMarkImg, alertImg, alertSound, tooHotImg, lampImg, explosionImg, explosionSound;
let slider;
let W, H;
let carPos = 0;
let carVel = 0;
let carAcc = 0;
let tireAngle = 0;
let tireRotAnglePerW;
let selectedBtn = 0;
let carPosScale = 1, carVelScale = 0.1, carAccScale = 0.0001;
let explosionProgress = 0;
let explosionStep = 0.02;
let posPts = [];
let velPts = [];
let accPts = [];

function graph(pts, x, y, w, h, bgCol, lineCol) {
  push();
  fill(bgCol);
  stroke(lineCol);
  strokeWeight(2);
  rect(x,y,w,h);
  let maxNum = max(pts);
  let minNum = min(pts);
  for (let i=1; i<pts.length; i++) {
    line((i-1)/pts.length*w+x, map(pts[i-1],maxNum,minNum,y,y+h), (i)/pts.length*w+x, map(pts[i],maxNum,minNum,y,y+h));
  }
  if (0>=minNum && 0<=maxNum) {
    stroke(255);
    let axisY = map(0,maxNum,minNum,y,y+h);
    line(x, axisY, x+w, axisY);
  }
  pop();
}

function drawGraphs() {
  let graphsY = H*0.2;
  let graphsH = H*0.225;
  let space = W*0.02;
  let graphsW = (W-4*space)/3;
  let bgCol = color(0,0,0,200);
  graph(posPts, space, graphsY, graphsW, graphsH, bgCol, color(0,255,255));
  graph(velPts, graphsW + 2*space, graphsY, graphsW, graphsH, bgCol, color(255,0,255));
  graph(accPts, 2*graphsW + 3*space, graphsY, graphsW, graphsH, bgCol, color(255,255,0));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reset();
}

function preload() {
  carImg = loadImage("car.png");
  tireImg = loadImage("tire.png");
  fenceImg = loadImage("fence.png");
  alertImg = loadImage("alert.png");
  alertSound = loadSound("alert.aac");
  tooHotImg = loadImage("tooHot.png");
  lampImg = loadImage("lamp.png");
  explosionImg = loadImage("explosion.png");
  explosionSound = loadSound("explosion.mp3");
}

function resetSlider() {
  slider.position(W*0.01, H*0.1);
  slider.size(W*(1-0.02));
}

function resetButtons() {
  let btnY = 0;
  posBtn.position(0, btnY);
  velBtn.position(W/3, btnY);
  accBtn.position(W*2/3, btnY);
  posBtn.size(W/3);
  velBtn.size(W/3);
  accBtn.size(W/3);
}

function resetMovements() {
  carPos = 0;
  carVel = 0;
  carAcc = 0;
}

function reset() {
  W = width;
  H = height;
  resetSlider();
  resetButtons();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  slider = createSlider(-1, 1, 0, 0.005);
  posBtn = createButton("Position").mousePressed(()=>{
    selectedBtn = 0;
    resetMovements();
  });
  velBtn = createButton("Velocity").mousePressed(()=>{
    selectedBtn = 1;
    resetMovements();
  });
  accBtn = createButton("Acceleration").mousePressed(()=>{
    selectedBtn = 2;
    resetMovements();
  });
  reset();
  tireRotAnglePerW = 0;
  roadMarkImg = createGraphics(6,1);
  roadMarkImg.background(255);
}

function movementDraw(vt, vy, vw, vh, vs, img) {
  let vs1 = H*vs/W;
  let vw1 = H*vw/W;
  let totalW = vw1+vs1;
  let vt1 = vt*H/W;
  let nElems = ceil(1/totalW);
  for (let i=-1; i<=nElems; i++) {
    image(img, W*(vt1%totalW+i*totalW), H*vy, W*vw1, H*vh);
  }
}

function drawExplosion(vt) {
  let vt1 = 1-vt;
  push();
  imageMode(CENTER);
  image(explosionImg, W/2, H/2, H*vt1, H*vt1);
  pop();
}

function draw() {
  background(0, 166, 25);
  angleMode(RADIANS);
  noStroke();
  fill(119, 196, 254);
  rect(0,0,W,H*0.4);
  fill(19, 21, 19);
  let roadMiddleY = H*0.65;
  let roadH = H*0.2;
  rect(0,roadMiddleY-roadH/2,W,roadH);
  push();
  imageMode(CORNER);
  let roadMarkScale = 0.01;
  movementDraw(-carPos, roadMiddleY/H-roadMarkImg.height*roadMarkScale/2-0.015, roadMarkScale*roadMarkImg.width, roadMarkScale*roadMarkImg.height,0.1,roadMarkImg);
  pop();
  push();
  imageMode(CORNER);
  let lampScale = 0.0003;
  movementDraw(-carPos, (roadMiddleY-roadH/2)/H-lampImg.height*lampScale-0.02,lampScale*lampImg.width, lampScale*lampImg.height,2,lampImg);
  pop();
  push();
  let fenceScale = 0.0006;
  imageMode(CORNER);
  movementDraw(-carPos,(roadMiddleY-roadH/2)/H-fenceImg.height*fenceScale-0.01,fenceScale*fenceImg.width, fenceScale*fenceImg.height,0,fenceImg);
  movementDraw(-carPos,(roadMiddleY+roadH/2)/H-fenceImg.height*fenceScale+0.015,fenceScale*1.1*fenceImg.width, fenceScale*1.1*fenceImg.height,0,fenceImg);
  pop();
  let carScale = H*0.0004;
  let carW = carImg.width*carScale;
  let carH = carImg.height*carScale;
  push();
  imageMode(CORNER);
  image(carImg, W*0.5-carW/2,roadMiddleY-carH,carW,carH);
  pop();
  push();
  imageMode(CENTER);
  let tire0x = W*0.5-257*carScale;
  let tire1x = W*0.5+266.5*carScale;
  let tireY = roadMiddleY-86*carScale;
  let tireW = tireImg.width*0.34*carScale;
  translate(tire0x,tireY);
  rotate(tireAngle);
  image(tireImg, 0, 0, tireW, tireW);
  pop();
  push();
  imageMode(CENTER);
  translate(tire1x,tireY);
  rotate(tireAngle);
  image(tireImg, 0, 0, tireW, tireW);
  pop();
  
  if (frameCount%20==0) {
    let maxSamples = 60;
    posPts.push(carPos);
    if (posPts.length>maxSamples) {
      posPts.shift();
    }
    velPts.push(carVel);
    if (velPts.length>maxSamples) {
      velPts.shift();
    }
    accPts.push(carAcc);
    if (accPts.length>maxSamples) {
      accPts.shift();
    }
  }
  drawGraphs();
  
  if (abs(carVel)>0.15) {
    reset();
    resetMovements();
    explosionProgress = 1-explosionStep;
    explosionSound.play();
  }
  
  if (explosionProgress<=0) {
    if (abs(carVel)>0.1) {
      let tooHotScale = 0.001;
      image(tooHotImg, W-H*tooHotImg.width*tooHotScale, H-H*tooHotImg.height*tooHotScale, H*tooHotImg.width*tooHotScale, H*tooHotImg.height*tooHotScale);
      if (floor(frameCount/30)%2==0) {
        let alertScale = 0.000001;
        if (W>H) {
          alertScale *= H;
        }
        else {
          alertScale *= W;
        }
        push();
        imageMode(CENTER);
        image(alertImg, W/2, H/2, H*alertImg.width*alertScale, H*alertImg.height*alertScale);
        pop();
      }
      if (!alertSound.isPlaying()) {
        alertSound.play();
      }
    }
    else {
      if (alertSound.isPlaying()) {
        alertSound.stop();
      }
    }
    if (selectedBtn == 2) {
      carAcc = slider.value()*carAccScale;
    }
    else if (selectedBtn == 1) {
      carVel = slider.value()*carVelScale;
    }
    else {
      carPos = slider.value()*carPosScale;
    }
    carVel += carAcc;
    carPos += carVel;
    tireAngle = carPos*2*H/(tireW*PI);
  }
  else {
    drawExplosion(explosionProgress);
    explosionProgress -= explosionStep;
  }
}
