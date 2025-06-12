class creature{
  constructor(startingX, startingY){
    //array for storing each segment
    this.body = [];
    
    this.pos = createVector(startingX,startingY);
    this.previous = this.pos.copy();
    //initialize with random velocity
    this.vel = createVector(random(-1,1), random(-1,1));
    //set magnitudes 
    this.vel.setMag(random(1.5,2));
    this.acc = createVector(0,0);
    //how many elements in body array 
    let len = 20;
    //starting radius
    let r1 = 5;

    this.killed = false;

        //unitless coefficient for bouncing
    this.elasticity = 1.0;
    
    //tangentinal compnent of the velocity, loses speed along collider
    // this.friction = 2;

    this.radius = r1;
    
    this.speed = 4;
    this.force = 1;
    
     this.attacking = true;
    this.cooldown = 60;
    this.fleeing = false;
    
    for(let i = 0; i < len; i++){
        //interpolate from radius to 0 across len steps
      let r = r1 - i * (r1/(len-1));
      //x, y, starting angle, distance from each segment, radius, and color (rgb)
      this.body.push(new segment(this.pos.x - i *r1, this.pos.y, 0, r*0.75, r, i * 50,i * 5,i * 2));
    }
  
  }
  
  applyForces(force){
    //vector addition for acceleration.
    //craig reynolds steering, desired velocity - current velocity
    this.acc.add(force);
  }
  
  seperation(boids){
    //steer to avoid crowding local flockmates
    //average of opposite velocities based on perceived others, proportional to distance
    let perception = 30;
    let steering = createVector();
    //amount of others in percieved radius
    let total = 0;
    //finding 'other' boids in the percieved radius
    for(let other of boids){
      //calculate distance from others
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      //not counting itself
      if (other != this && d < perception && d > 0.1){
        //subtracts two vectors
        let difference = p5.Vector.sub(this.pos, other.pos);
        //inversely proportion
        difference.div(d);
         steering.add(difference);
        //iterate for each one in radius
        total++;
      }
    }
    //adding up values and dividing by length for average
    if(total > 0) {
      steering.div(total);
      steering.setMag(this.speed);
      steering.sub(this.vel);
      steering.limit(this.force);
    }
    return steering;
  }
  
  alignment(boids){
    //steer towards average heading of local flockmates
    let perception = 30;
    let steering = createVector();
    //amount of others in percieved radius
    let total = 0;
    //finding 'other' boids in the percieved radius
    for(let other of boids){
      //calculate distance from others
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      //not counting itself
      if (other != this && d < perception){
         steering.add(other.vel);
        //iterate for each one in radius
        total++;
      }
    }
    //adding up values and dividing by length for average
    if(total > 0) {
      steering.div(total);
      steering.setMag(this.speed);
      steering.sub(this.vel);
      steering.limit(this.force);
    }
    return steering;
  }
  
    cohesion(boids){
    let perception = 30;
    let steering = createVector();
    let total = 0;
    //finding 'other' boids in the percieved radius
    for(let other of boids){
      //calculate distance from others
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      //not counting itself
      if (other != this && d < perception){
        //this time add others position
         steering.add(other.pos);
        //iterate for each one in radius
        total++;
      }
    }
    //adding up values and dividing by length for average
    if(total > 0) {
      steering.div(total);
      //subtract position to get closer
      steering.sub(this.pos);
      steering.setMag(this.speed);
      steering.sub(this.vel);
      steering.limit(this.force);
    }
    return steering;
  }
  
  chase(target){
    //larger radius than self flocking
    let perception = 70;
    let steering = createVector();
    //finding distance from target vector
     let d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if(d < perception && this.cooldown >= 60){
      this.attacking = true;
      //vector between current position and target position 
      //dont do target.pos because target is already a vector 
      let desired = p5.Vector.sub(target, this.pos);
      desired.setMag(this.speed);
      //turn in that direction
      //add for chase, sub for run
      steering.add(desired, this.vel);
           // steering.sub(desired, this.vel);
      steering.limit(this.force);
    }
      if(d< 10){
       this.attacking = false;
        this.fleeing = true;
      }
    if (this.fleeing == true ){
      this.cooldown-= 1;
        let desired = p5.Vector.sub(target, this.pos);
      desired.setMag(this.speed * 2.0);
      //turn in that direction
      //add for chase, sub for run
      // steering.add(desired, this.vel);
      steering.sub(desired, this.vel);
      steering.limit(this.force);
    }
    if(this.cooldown <= 0){
      this.cooldown = 60;
      this.fleeing = false;
    }
    return steering;
  }
  
  
  flock(boids, target){

    if(!this.killed){
    
    let sep = this.seperation(boids);
    sep.mult(1.5);
    this.acc.add(sep);
    
    let align = this.alignment(boids);
    align.mult(1.0);
    this.acc.add(align);
    
    let coh = this.cohesion(boids);
    coh.mult(1.0);
    this.acc.add(coh);
    
    let follow = this.chase(target);
    follow.mult(1.10);
    this.acc.add(follow);
  }
  }
  
  edges() {
     let steering = createVector();
    let edge = 20;
    let turnForce = this.force * 5;
    
    //right border
    if(this.pos.x > width - edge){
      //negative for left
      let turn = createVector(-1,0);
      //-1 * (position - (when2turn / force of turning ))
      turn.mult((this.pos.x - (width - edge)) / edge * turnForce);
      steering.add(turn);
    }
    
        //left border
    if(this.pos.x < edge){
      //positive for right
      let turn = createVector(1,0);
      //1 * (position - (when2turn / force of turning ))
      turn.mult((edge - this.pos.x) / edge * turnForce);
      steering.add(turn);
    }
    
        //top border
    if(this.pos.y < edge){
      let turn = createVector(0,1);
      //-1 * (position - (when2turn / force of turning ))
      turn.mult((edge - this.pos.y) / edge * turnForce);
      steering.add(turn);
    }
    
        //bottom border
    if(this.pos.y > height - edge){
      let turn = createVector(0,-1);
      //1 * (position - (when2turn / force of turning ))
      turn.mult((this.pos.y - (height - edge)) / edge * turnForce);
      steering.add(turn);
    }
    
    if ((this.pos.x < edge || this.pos.x > width - edge) &&
    (this.pos.y < edge || this.pos.y > height - edge)) {
  steering.mult(0.25); // dampen steering near corners
}
    return steering;
  }
  
  update(){
    //first segment, leads direction
    //move position based on velocity vector
      this.pos.add(this.vel);
    //add acceleration forces based on behavior
    this.vel.add(this.acc);
    //ensure velocity doesnt add up into oblivion
    this.vel.limit(this.speed);
    //reset acceleration
    this.acc.mult(0);
    
    //assign head
    this.body[0].x = this.pos.x;
     this.body[0].y = this.pos.y;
    
    //start at 1 for tail segments because 0 is reserved for head
    for ( let i = 1; i < this.body.length; i++){
      let c =this.body[i];
      let p = this.body[i - 1];
      c.update(p);
    }
  }

  isKilled(playerSoftBody){
    if(playerSoftBody.points.some(p => p.position.dist(this.pos) < this.radius) && playerSoftBody.attacked == true){
      this.killed = true
    }
  }

  
  display(){
    for(let i = 0; i < this.body.length; i++){
      let s = this.body[i];
      s.display();
    }
  }
  
}