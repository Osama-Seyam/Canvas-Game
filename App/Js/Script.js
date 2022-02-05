const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d')

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.getElementById('scoreEl')
const easy = document.getElementById('easy')
const normal = document.getElementById('normal')
const hard = document.getElementById('hard')
const start = document.getElementById('start')

const restartGameBtn = document.getElementById('btn')
const modal = document.getElementById('modal')
const finalScore = document.getElementById('finalScore')

// generating a player

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius,
            0, Math.PI * 2, false)

        ctx.fillStyle = this.color
        ctx.fill()
    }
}

// generating bullets 

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius,
            0, Math.PI * 2, false)

        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}


class Enemy {
    constructor(x, y, raduis, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = raduis;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius,
            0, Math.PI * 2, false)

        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99;
class particle {
    constructor(x, y, raduis, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = raduis;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius,
            0, Math.PI * 2, false)

        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white')
let Projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 10, 'white')
    Projectiles = []
    enemies = []
    particles = []

    score = 0
    scoreEl.innerHTML = score
    finalScore.innerHTML = score
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;

        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius :
                canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius :
                canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50% )`;

        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x)

        const velocity = {
            x: Math.cos(angle) * velocityRatio,
            y: Math.sin(angle) * velocityRatio
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animationId
let score = 0

function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    // animate projectiles
    Projectiles.forEach((projectile, index) => {
        projectile.update()

        // remove from edges of screen
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                Projectiles.splice(index, 1)
            }, 0)
        }
    })

    // animate particles 
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
        particle.update()
    })

    // animate enemys
    enemies.forEach((enemy, index) => {
        enemy.update()

        // when my player gets touched => end game
        const dist = Math.hypot(player.x - enemy.x,
            player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            modal.classList.remove('display')
            finalScore.innerHTML = score
        }


        Projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x,
                projectile.y - enemy.y)

            // when projectiles touch enemies
            if (dist - enemy.radius - projectile.radius < 1) {

                // create explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new particle(projectile.x,
                        projectile.y, Math.random() * 2, enemy.color, {
                            x: (Math.random() - 0.5) * (Math.random() * 5),
                            y: (Math.random() - 0.5) * (Math.random() * 5)
                        }))
                }
                if (enemy.radius - 10 > 5) {
                    // increase our score 
                    score += 100;
                    scoreEl.innerHTML = score;

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        Projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    // remove from scene altogether
                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        Projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2)

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    Projectiles.push(new Projectile(
        canvas.width / 2, canvas.height / 2,
        5, 'white', velocity))
})

let velocityRatio;

easy.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()

    velocityRatio = 1

    start.style.display = 'none'
})

normal.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()

    velocityRatio = 2

    start.style.display = 'none'
})

hard.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()

    velocityRatio = 3

    start.style.display = 'none'
})

restartGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()

    modal.classList.add('display')
})