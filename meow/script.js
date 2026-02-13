// Game Configuration
const TILE_SIZE = 40;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 3;
const INTERACTION_DISTANCE = 60;

// Game States
const GAME_STATE = {
    INITIAL: 0,
    FLOWERS_UNLOCKED: 1,
    GIFT_UNLOCKED: 2,
    PROPOSAL: 3
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = GAME_STATE.INITIAL;
let hasFlowers = false;
let hasGift = false;

// Player position
const player = {
    x: 100,
    y: 100,
    width: 30,
    height: 40,
    color: '#4169e1' // Royal Blue for player
};

// Girlfriend NPC
const girlfriend = {
    x: 600,
    y: 300,
    width: 30,
    height: 40,
    color: '#ff69b4' // Hot Pink for girlfriend
};

// Shops
const flowerShop = {
    x: 50,
    y: 500,
    width: 130,
    height: 130,
    visible: false,
    emoji: '🌸'
};

const giftShop = {
    x: 600,
    y: 100,
    width: 130,
    height: 130,
    visible: false,
    emoji: '🎁'
};

// Trees (obstacles)
const trees = [
    { x: 300, y: 150 },
    { x: 500, y: 200 },
    { x: 150, y: 300 },
    { x: 400, y: 400 },
    { x: 700, y: 450 },
    { x: 250, y: 500 }
];

// Keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Modal controls
const dialogueModal = document.getElementById('dialogueModal');
const shopModal = document.getElementById('shopModal');
const proposalModal = document.getElementById('proposalModal');
const dialogueText = document.getElementById('dialogueText');
const girlfriendPortrait = document.getElementById('girlfriendPortrait');
const continueBtn = document.getElementById('continueBtn');
const buyBtn = document.getElementById('buyBtn');
const closeShopBtn = document.getElementById('closeShopBtn');
const shopTitle = document.getElementById('shopTitle');
const shopItem = document.getElementById('shopItem');

// Proposal modal elements
const proposalQuestion = document.getElementById('proposalQuestion');
const proposalButtons = document.getElementById('proposalButtons');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const saveGameSection = document.getElementById('saveGameSection');
const saveYesBtn = document.getElementById('saveYesBtn');
const saveNoBtn = document.getElementById('saveNoBtn');
const finalMessage = document.getElementById('finalMessage');

// Set girlfriend portrait image
girlfriendPortrait.src = 'girlfriend_portrait.png';

// Queued dialouges
const nextDialogue = [];

// Whether dialouge is over and should open proposal modal
let isDialogueOver = false;

let currentShop = null;

// Load character sprites
const playerSprite = new Image();
playerSprite.src = 'player_sprite.png';

const girlfriendSprite = new Image();
girlfriendSprite.src = 'girlfriend_sprite_0.png';

// Load environment sprites
const treeSprite = new Image();
treeSprite.src = 'tree.png';

const flowerShopSprite = new Image();
flowerShopSprite.src = 'flower_shop.png';

const giftShopSprite = new Image();
giftShopSprite.src = 'gift_shop.png';

// Drawing functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCharacter(character, sprite) {
    // Draw sprite image if loaded, otherwise draw simple rectangle
    if (sprite && sprite.complete) {
        // Draw the sprite image centered on the character position
        // Sprites are designed to be larger than the hitbox for visual appeal
        const spriteWidth = character.width * 2;  // Make sprites appear larger
        const spriteHeight = character.height * 2;
        const offsetX = character.x - character.width / 2;
        const offsetY = character.y - character.height;
        
        ctx.imageSmoothingEnabled = false; // Keep pixels crisp
        ctx.drawImage(sprite, offsetX, offsetY, spriteWidth, spriteHeight);
    } else {
        // Fallback to rectangle drawing if image not loaded
        drawRect(character.x, character.y, character.width, character.height, character.color);
        
        // Head
        const headSize = character.width * 0.8;
        const headX = character.x + (character.width - headSize) / 2;
        const headY = character.y - headSize - 2;
        ctx.fillStyle = '#ffd4a3';
        ctx.fillRect(headX, headY, headSize, headSize);
        
        // Eyes
        const eyeSize = 4;
        const eyeY = headY + headSize * 0.4;
        ctx.fillStyle = '#000';
        ctx.fillRect(headX + 5, eyeY, eyeSize, eyeSize);
        ctx.fillRect(headX + headSize - 9, eyeY, eyeSize, eyeSize);
        
        // Smile
        ctx.fillStyle = '#000';
        ctx.fillRect(headX + 6, headY + headSize * 0.7, headSize - 12, 2);
    }
}

function drawTree(tree) {
    // Use sprite if loaded, otherwise draw programmatically
    if (treeSprite && treeSprite.complete) {
        const treeSize = 60;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(treeSprite, tree.x - treeSize / 2, tree.y - treeSize / 2, treeSize, treeSize);
    } else {
        // Fallback: programmatic tree drawing
        // Tree trunk
        const trunkWidth = 15;
        const trunkHeight = 25;
        const trunkX = tree.x - trunkWidth / 2;
        const trunkY = tree.y - trunkHeight / 2;
        drawRect(trunkX, trunkY, trunkWidth, trunkHeight, '#8b4513');
        
        // Tree foliage (3 circles of green)
        const foliageSize = 40;
        const foliageX = tree.x - foliageSize / 2;
        const foliageY = tree.y - trunkHeight - foliageSize / 2;
        
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.arc(tree.x, foliageY + 10, foliageSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tree.x - 15, foliageY + 20, foliageSize / 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tree.x + 15, foliageY + 20, foliageSize / 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawShop(shop) {
    if (!shop.visible) return;
    
    // Determine which sprite to use
    const sprite = shop.emoji === '🌸' ? flowerShopSprite : giftShopSprite;
    
    // Use sprite if loaded, otherwise draw programmatically
    if (sprite && sprite.complete) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, shop.x, shop.y, shop.width, shop.height);
    } else {
        // Fallback: programmatic shop drawing
        // Building
        drawRect(shop.x, shop.y, shop.width, shop.height, '#d2691e');
        
        // Roof
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.moveTo(shop.x - 5, shop.y);
        ctx.lineTo(shop.x + shop.width + 5, shop.y);
        ctx.lineTo(shop.x + shop.width / 2, shop.y - 15);
        ctx.closePath();
        ctx.fill();
        
        // Emoji sign
        ctx.font = '30px Arial';
        ctx.fillText(shop.emoji, shop.x + 15, shop.y + 40);
    }
}

function drawGrass() {
    // Base grass
    ctx.fillStyle = '#56a031';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Add some texture with darker grass patches
    ctx.fillStyle = '#4a8c2a';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137) % CANVAS_WIDTH;
        const y = (i * 197) % CANVAS_HEIGHT;
        ctx.fillRect(x, y, 8, 8);
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function getDistance(obj1, obj2) {
    const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
    const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
}

// Player movement
function updatePlayer() {
    const oldX = player.x;
    const oldY = player.y;
    
    // Movement
    if (keys['arrowup'] || keys['w']) player.y -= PLAYER_SPEED;
    if (keys['arrowdown'] || keys['s']) player.y += PLAYER_SPEED;
    if (keys['arrowleft'] || keys['a']) player.x -= PLAYER_SPEED;
    if (keys['arrowright'] || keys['d']) player.x += PLAYER_SPEED;
    
    // Boundary check
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));
    
    // Tree collision
    trees.forEach(tree => {
        const treeRect = { x: tree.x - 20, y: tree.y - 20, width: 40, height: 40 };
        if (checkCollision(player, treeRect)) {
            player.x = oldX;
            player.y = oldY;
        }
    });
}

// Interaction detection
function checkInteractions() {
    // Check girlfriend proximity
    const distToGirlfriend = getDistance(player, girlfriend);
    if (distToGirlfriend < INTERACTION_DISTANCE && keys[' ']) {
        keys[' '] = false; // Prevent multiple triggers
        interactWithGirlfriend();
    }
    
    // Check flower shop proximity
    if (flowerShop.visible && getDistance(player, flowerShop) < INTERACTION_DISTANCE && keys[' ']) {
        keys[' '] = false;
        openShop('flower');
    }
    
    // Check gift shop proximity
    if (giftShop.visible && getDistance(player, giftShop) < INTERACTION_DISTANCE && keys[' ']) {
        keys[' '] = false;
        openShop('gift');
    }
}

// Girlfriend interaction
function interactWithGirlfriend() {
    if (gameState === GAME_STATE.INITIAL) {
        showDialogue("Abediiii!!!");
        nextDialogue.push("Didn't you forget something?");
        gameState = GAME_STATE.FLOWERS_UNLOCKED;
        flowerShop.visible = true;
        girlfriendSprite.src = 'girlfriend_sprite_1.png';
    } else if (gameState === GAME_STATE.FLOWERS_UNLOCKED && hasFlowers) {
        showDialogue("Are you sure you didn't forget anything?");
        gameState = GAME_STATE.GIFT_UNLOCKED;
        giftShop.visible = true;
        girlfriendSprite.src = 'girlfriend_sprite_2.png';
    } else if (gameState === GAME_STATE.GIFT_UNLOCKED && hasFlowers && hasGift) {
        gameState = GAME_STATE.PROPOSAL;
        isDialogueOver = true;
        showDialogue("Khodaaaa Nakoshaatet");
    } else {
        // Sometimes randomly just say Abediii!!!
        if (Math.random() < 0.1) {
            showDialogue("Abediiii!!!");
            return;
        }
        // Player hasn't bought items yet
        else if (!hasFlowers) {
            showDialogue("Maybe check out the flower shop?");
        } else if (!hasGift) {
            showDialogue("Maybe look around?");
        }
    }
}

// Show dialogue modal
function showDialogue(text) {
    dialogueText.textContent = text;
    dialogueModal.classList.add('active');
}

continueBtn.addEventListener('click', () => {
    dialogueModal.classList.remove('active');
    if (nextDialogue.length > 0) {
        showDialogue(nextDialogue.shift());
    }
    else if (isDialogueOver) {
        showProposal();
    }
});

// Shop system
function openShop(type) {
    currentShop = type;
    if (type === 'flower') {
        if (hasFlowers) {
            showDialogue("You already have flowers!");
            return;
        }
        shopTitle.textContent = '🌸 Flower Shop 🌸';
        shopItem.textContent = '💐';
    } else if (type === 'gift') {
        if (hasGift) {
            showDialogue("You already have a gift!");
            return;
        }
        shopTitle.textContent = '🎁 Gift Shop 🎁';
        shopItem.textContent = '🎀';
    }
    shopModal.classList.add('active');
}

buyBtn.addEventListener('click', () => {
    if (currentShop === 'flower') {
        hasFlowers = true;
        showDialogue("You bought beautiful flowers! 💐");
    } else if (currentShop === 'gift') {
        hasGift = true;
        showDialogue("You bought a lovely gift! 🎀");
    }
    shopModal.classList.remove('active');
});

closeShopBtn.addEventListener('click', () => {
    shopModal.classList.remove('active');
});

// Show proposal
function showProposal() {
    // Reset proposal modal state
    proposalButtons.style.display = 'flex';
    saveGameSection.style.display = 'none';
    finalMessage.style.display = 'none';
    proposalModal.classList.add('active');
}

// Proposal button handlers
yesBtn.addEventListener('click', () => {
    proposalButtons.style.display = 'none';
    saveGameSection.style.display = 'block';
});

noBtn.addEventListener('click', () => {
    proposalModal.classList.remove('active');
    // Reset game state to try again
});

saveYesBtn.addEventListener('click', () => {
    saveGameSection.style.display = 'none';
    finalMessage.style.display = 'block';
});

saveNoBtn.addEventListener('click', () => {
    proposalModal.classList.remove('active');
});

// Draw interaction hints
function drawHints() {
    ctx.font = '12px "Press Start 2P"';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    
    // Girlfriend hint
    const distToGirlfriend = getDistance(player, girlfriend);
    if (distToGirlfriend < INTERACTION_DISTANCE) {
        const text = 'Press SPACE';
        const textX = girlfriend.x - 30;
        const textY = girlfriend.y - 50;
        ctx.strokeText(text, textX, textY);
        ctx.fillText(text, textX, textY);
    }
    
    // Shop hints
    if (flowerShop.visible && getDistance(player, flowerShop) < INTERACTION_DISTANCE) {
        const text = 'Press SPACE';
        const textX = flowerShop.x;
        const textY = flowerShop.y - 20;
        ctx.strokeText(text, textX, textY);
        ctx.fillText(text, textX, textY);
    }
    
    if (giftShop.visible && getDistance(player, giftShop) < INTERACTION_DISTANCE) {
        const text = 'Press SPACE';
        const textX = giftShop.x;
        const textY = giftShop.y - 20;
        ctx.strokeText(text, textX, textY);
        ctx.fillText(text, textX, textY);
    }
}

// Game loop
function gameLoop() {
    // Clear and draw background
    drawGrass();
    
    // Draw trees
    trees.forEach(tree => drawTree(tree));
    
    // Draw shops
    drawShop(flowerShop);
    drawShop(giftShop);
    
    // Draw girlfriend
    drawCharacter(girlfriend, girlfriendSprite);
    
    // Update and draw player
    updatePlayer();
    drawCharacter(player, playerSprite);
    
    // Check interactions
    checkInteractions();
    
    // Draw hints
    drawHints();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
