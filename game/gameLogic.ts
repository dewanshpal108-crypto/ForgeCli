// Core engine: bird/pipe entities, game loop, physics, collisions and scoring.

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Minimal canvas context type for environments without DOM typings.
export type CanvasRenderingContext2D = any;

// --- Tunable physics / gameplay constants ---
const GRAVITY = 0.5;          // downward acceleration applied to the bird each frame
const JUMP_VELOCITY = -8;     // fixed upward velocity when the player jumps
const PIPE_SPEED = 4;         // constant leftward speed of pipes (px/frame)
const PIPE_WIDTH = 60;        // pipe width in px
const PIPE_GAP = 150;         // constant vertical gap between top & bottom pipes
const PIPE_INTERVAL = 90;     // frames between pipe spawns
const EDGE_MARGIN = 50;       // keep the gap away from the very top/bottom

export type OnScoreCallback = (score: number) => void;
export type OnGameOverCallback = () => void;

/** The player-controlled bird. */
export class Bird {
  velocityY = 0;

  constructor(
    public x: number,
    public y: number,
    public radius: number
  ) {}

  /** Apply gravity and integrate vertical position. */
  update(): void {
    this.velocityY += GRAVITY;
    this.y += this.velocityY;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#FFD400';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  getBoundingBox(): BoundingBox {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }
}

/** A pair of top/bottom pipes sharing a randomized vertical gap. */
export class Pipe {
  x: number;
  scored = false;
  private gapY: number;

  constructor(
    startX: number,
    private canvasHeight: number,
    width = PIPE_WIDTH,
    gap = PIPE_GAP
  ) {
    this.x = startX;
    this.width = width;
    this.gap = gap;
    const minTop = EDGE_MARGIN;
    const maxTop = this.canvasHeight - this.gap - EDGE_MARGIN;
    // Randomize the Y-position of the gap for each pipe pair.
    this.gapY = minTop + Math.random() * (maxTop - minTop);
  }

  width: number;
  gap: number;

  update(): void {
    this.x -= PIPE_SPEED;
  }

  getBoundingBoxes(): { top: BoundingBox; bottom: BoundingBox } {
    const top: BoundingBox = {
      x: this.x,
      y: 0,
      width: this.width,
      height: this.gapY,
    };
    const bottom: BoundingBox = {
      x: this.x,
      y: this.gapY + this.gap,
      width: this.width,
      height: this.canvasHeight - (this.gapY + this.gap),
    };
    return { top, bottom };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#2ECC71';
    const { top, bottom } = this.getBoundingBoxes();
    ctx.fillRect(top.x, top.y, top.width, top.height);
    ctx.fillRect(bottom.x, bottom.y, bottom.width, bottom.height);
  }
}

/** Axis-Aligned Bounding Box intersection test. */
export function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Starts the game loop on the given canvas.
 * @returns an object exposing `stop()` to cancel the loop and cleanup listeners.
 */
export function startGame(
  canvas: { width: number; height: number },
  ctx: CanvasRenderingContext2D,
  onScore: OnScoreCallback,
  onGameOver: OnGameOverCallback
) {
  const bird = new Bird(canvas.width / 4, canvas.height / 2, 15);
  const pipes: Pipe[] = [];

  let frame = 0;
  let score = 0;
  let running = true;
  let rafId = 0;

  const jump = (): void => {
    if (running) bird.velocityY = JUMP_VELOCITY;
  };

  type KeyboardEventWithCode = KeyboardEvent & { code?: string };
  const handleKeyDown = (e: KeyboardEventWithCode): void => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  };
  const handleMouseDown = (): void => jump();

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);

  const endGame = (): void => {
    if (!running) return;
    running = false;
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
    cancelAnimationFrame(rafId);
    onGameOver();
  };

  const loop = (): void => {
    if (!running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Update bird ---
    bird.update();

    // Ground / boundary collision.
    if (bird.y + bird.radius >= canvas.height) {
      endGame();
      return;
    }

    // --- Spawn pipes just outside the right edge ---
    if (frame % PIPE_INTERVAL === 0) {
      pipes.push(new Pipe(canvas.width, canvas.height));
    }

    // --- Update pipes, scoring and collision ---
    const birdBox = bird.getBoundingBox();
    for (let i = pipes.length - 1; i >= 0; i--) {
      const pipe = pipes[i];
      if (!pipe) continue;
      pipe.update();

      // Score when the bird passes the pipe pair's X-coordinate.
      if (!pipe.scored && pipe.x + pipe.width < bird.x) {
        pipe.scored = true;
        score += 1;
        onScore(score);
      }

      // AABB collision with either segment of the pipe pair.
      const { top, bottom } = pipe.getBoundingBoxes();
      if (
        boxesIntersect(birdBox, top) ||
        boxesIntersect(birdBox, bottom)
      ) {
        endGame();
        return;
      }

      // Remove pipes that have fully left the screen.
      if (pipe.x + pipe.width < 0) {
        pipes.splice(i, 1);
      }
    }

    // --- Draw ---
    pipes.forEach((p) => p.draw(ctx));
    bird.draw(ctx);

    frame += 1;
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);

  return { stop: endGame };
}
