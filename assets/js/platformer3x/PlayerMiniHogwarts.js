import GameEnv from './GameEnv.js';
import PlayerBase from './PlayerBase.js';
import GameControl from './GameControl.js';

/**
 * @class PlayerHills class
 * @description PlayerHills.js key objective is to eent the user-controlled character in the game.   
 * 
 * The Player class extends the Character class, which in turn extends the GameObject class.
 * Animations and events are activated by key presses, collisions, and gravity.
 * WASD keys are used by user to control The Player object.  
 * 
 * @extends PlayerBase 
 */
export class PlayerMiniHogwarts extends PlayerBase {

    /** GameObject instantiation: constructor for PlayerHills object
     * @extends Character 
     * @param {HTMLCanvasElement} canvas - The canvas element to draw the player on.
     * @param {HTMLImageElement} image - The image to draw the player with.
     * @param {Object} data - The data object containing the player's properties.
     */
    constructor(canvas, image, data) {
        super(canvas, image, data);
        const scaledHeight = GameEnv.innerHeight * (100 / 832);
        const finishlineX = .01 * GameEnv.innerWidth;
        this.setX(finishlineX);
        this.hillsStart = true;

        // Goomba variables, deprecate?
        this.timer = false;
        GameEnv.invincible = false; // Player is not invincible 
    }

    /**
     * @override
     * gameLoop helper: Update Player jump height, replaces PlayerBase updateJump using settings from GameEnv
     */
    updateJump() {  
        let jumpHeightFactor;
        if (GameEnv.difficulty === "easy") {
            jumpHeightFactor = 0.50;
        } else if (GameEnv.difficulty === "normal") {
            jumpHeightFactor = 0.40;
        } else {
            jumpHeightFactor = 0.30;
        }
        this.setY(this.y - (this.bottom * jumpHeightFactor));
    }
    update(){
            super.update();
        if (this.hillsStart) {
                this.setY(0);
                this.hillsStart = false;
            }
        }
    /**
     * @override
     * gameLoop: Watch for Player collision events 
     */ 
    handleCollisionStart() {
        super.handleCollisionStart(); // calls the super class method
        // adds additional collision events
        this.handleCollisionEvent("finishline");
        this.handleCollisionEvent("goomba");
        this.handleCollisionEvent("mushroom");

    }
   
    /**
     * @override
     * gameloop: Handles additional Player reaction / state updates to the collision for game level 
     */
    handlePlayerReaction() {
        super.handlePlayerReaction(); // calls the super class method
        // handles additional player reactions
        switch (this.state.collision) {
            case "finishline":
                // 1. Caught in finishline
                if (this.collisionData.touchPoints.this.onTopofOther  || this.state.isFinishing ) {
                    // Position player in the center of the finishline 
                    this.x = this.collisionData.newX;
                    this.state.movement = { up: false, down: false, left: false, right: false, falling: false};
                    this.state.isFinishing = true;
                    this.gravityEnabled = true;
                    // Using natural gravity wait for player to reach floor
                    if (Math.abs(this.y - this.bottom) <= GameEnv.gravity) {
                        // Force end of level condition
                        //this.x = GameEnv.innerWidth + 1;
                        const index = GameEnv.levels.findIndex(level => level.tag === "Quidditch")
                        GameControl.transitionToLevel(GameEnv.levels[index]);
                        return                    
                    }
                // 2. Collision between player right and finishline   
                } else if (this.collisionData.touchPoints.this.right) {
                    this.state.movement.right = false;
                    this.state.movement.left = true;
                // 3. Collision between player left and finishline
                } else if (this.collisionData.touchPoints.this.left) {
                    this.state.movement.left = false;
                    this.state.movement.right = true;
                }
                break;
            case "goomba": // Note: Goomba.js and Player.js could be refactored
                // 1. Player jumps on goomba, interaction with Goomba.js
                if (this.collisionData.touchPoints.this.top && this.collisionData.touchPoints.other.bottom && this.state.isDying == false) {
                    // GoombaBounce deals with player.js and goomba.js
                    if (GameEnv.goombaBounce === true) {
                        GameEnv.goombaBounce = false;
                        this.y = this.y - 100;
                    }
                    if (GameEnv.goombaBounce1 === true) {
                        GameEnv.goombaBounce1 = false; 
                        this.y = this.y - 250
                    }
                // 2. Player touches goomba sides of goomba 
                } else if (this.collisionData.touchPoints.this.right || this.collisionData.touchPoints.this.left) {
                    if (GameEnv.difficulty === "normal" || GameEnv.difficulty === "hard") {
                        if (this.state.isDying == false) {
                            this.state.isDying = true;
                            this.canvas.style.transition = "transform 0.5s";
                            this.canvas.style.transform = "rotate(-90deg) translate(-26px, 0%)";
                            GameEnv.playSound("PlayerDeath");
                            setTimeout(async() => {
                                await GameControl.transitionToLevel(GameEnv.levels[GameEnv.levels.indexOf(GameEnv.currentLevel)]);
                            }, 900); 
                        }
                    } else if (GameEnv.difficulty === "easy" && this.collisionData.touchPoints.this.right) {
                        this.x -= 10;
                    } else if (GameEnv.difficulty === "easy" && this.collisionData.touchPoints.this.left) {
                       this.x += 10;
                    }
                
                }
                break;
            case "mushroom": // 
                // Player touches mushroom   
                if (GameEnv.destroyedMushroom === false) {
                    GameEnv.destroyedMushroom = true;
                    this.canvas.style.filter = 'invert(1)';
                    // Invert state lasts for 2 seconds
                    setTimeout(() => {
                        this.canvas.style.filter = 'invert(0)';
                    }, 2000); // 2000 milliseconds = 2 seconds
                }
                break;  
        }

    }

}

export default PlayerMiniHogwarts;