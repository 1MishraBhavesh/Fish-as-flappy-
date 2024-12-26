import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class FinnyFrenzy extends SurfaceView implements SurfaceHolder.Callback {

    private GameThread gameThread;
    private Paint paint;
    private float fishY, fishVelocity;
    private float pipeX, pipeGapTop, pipeGapBottom;
    private int screenWidth, screenHeight;
    private int score;
    private boolean isPlaying;

    private final float GRAVITY = 0.5f;
    private final float JUMP_FORCE = -10f;
    private final int PIPE_WIDTH = 50;
    private final int PIPE_GAP = 200;

    public FinnyFrenzy(Context context) {
        super(context);
        getHolder().addCallback(this);
        paint = new Paint();
        paint.setAntiAlias(true);
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        gameThread = new GameThread(holder);
        gameThread.setRunning(true);
        gameThread.start();
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        screenWidth = width;
        screenHeight = height;
        resetGame();
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        boolean retry = true;
        gameThread.setRunning(false);
        while (retry) {
            try {
                gameThread.join();
                retry = false;
            } catch (InterruptedException e) {
            }
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            fishVelocity = JUMP_FORCE;
        }
        return true;
    }

    private void resetGame() {
        fishY = screenHeight / 2;
        fishVelocity = 0;
        pipeX = screenWidth;
        pipeGapTop = (int) (Math.random() * (screenHeight - PIPE_GAP));
        score = 0;
        isPlaying = true;
    }

    private void update() {
        if (!isPlaying) {
            return;
        }

        fishY += fishVelocity;
        fishVelocity += GRAVITY;

        pipeX -= 5; // Adjust pipe speed as needed

        if (pipeX + PIPE_WIDTH < 0) {
            pipeX = screenWidth;
            pipeGapTop = (int) (Math.random() * (screenHeight - PIPE_GAP));
            score++;
        }

        // Check for collisions
        if (fishY < 0 || fishY + 20 > screenHeight ||
                (fishX >= pipeX && fishX <= pipeX + PIPE_WIDTH &&
                        (fishY < pipeGapTop || fishY > pipeGapTop + PIPE_GAP))) {
            isPlaying = false;
        }
    }

    private void draw(Canvas canvas) {
        canvas.drawColor(Color.CYAN);

        // Draw fish
        paint.setColor(Color.YELLOW);
        canvas.drawRect(fishX, fishY, fishX + 20, fishY + 20, paint);

        // Draw pipes
        paint.setColor(Color.GREEN);
        canvas.drawRect(pipeX, 0, pipeX + PIPE_WIDTH, pipeGapTop, paint);
        canvas.drawRect(pipeX, pipeGapTop + PIPE_GAP, pipeX + PIPE_WIDTH, screenHeight, paint);

        // Draw score
        paint.setColor(Color.BLACK);
        paint.setTextSize(30);
        canvas.drawText("Score: " + score, 20, 50, paint);

        if (!isPlaying) {
            paint.setTextSize(50);
            canvas.drawText("Game Over", screenWidth / 2 - 150, screenHeight / 2, paint);
        }
    }

    private class GameThread extends Thread {
        private SurfaceHolder surfaceHolder;
        private boolean running;

        public GameThread(SurfaceHolder surfaceHolder) {
            this.surfaceHolder = surfaceHolder;
        }

        public void setRunning(boolean running) {
            this.running = running;
        }

        @Override
        public void run() {
            while (running) {
                Canvas canvas = null;
                try {
                    canvas = surfaceHolder.lockCanvas();
                    if (canvas != null) {
                        update();
                        draw(canvas);
                    }
                } finally {
                    if (canvas != null) {
                        surfaceHolder.unlockCanvasAndPost(canvas);
                    }
                }
            }
        }
    }
      }
                 
