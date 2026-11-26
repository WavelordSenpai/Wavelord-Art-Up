package com.wavelord.artup;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

// BUBBLE_RULE: collapsed tap = Return to App / Talk to AI / Exit App. Exit closes the overlay, no ending screen.
public class FloatingBuddyService extends Service {
    private WindowManager wm;
    private TextView bubble;
    private LinearLayout pop;
    private WindowManager.LayoutParams lp;
    private long justDragged = 0;

    @Override public IBinder onBind(Intent i) { return null; }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density); }

    @Override
    public void onCreate() {
        super.onCreate();
        String ch = "artup_buddy";
        if (Build.VERSION.SDK_INT >= 26) {
            getSystemService(NotificationManager.class).createNotificationChannel(
                new NotificationChannel(ch, "ArtUp bubble", NotificationManager.IMPORTANCE_MIN));
        }
        Notification.Builder nb = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, ch) : new Notification.Builder(this);
        startForeground(1, nb.setContentTitle("ArtUp bubble").setSmallIcon(android.R.drawable.ic_menu_edit).build());
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        final SharedPreferences sp = getSharedPreferences("artup", MODE_PRIVATE);
        bubble = new TextView(this);
        bubble.setText("\uD83C\uDFA8");
        bubble.setTextSize(26);
        bubble.setGravity(Gravity.CENTER);
        GradientDrawable g = new GradientDrawable();
        g.setShape(GradientDrawable.OVAL);
        g.setColor(Color.parseColor("#FFD700"));
        bubble.setBackground(g);
        lp = new WindowManager.LayoutParams(dp(56), dp(56),
            Build.VERSION.SDK_INT >= 26 ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.START;
        lp.x = sp.getInt("x", 20);
        lp.y = sp.getInt("y", 400);
        bubble.setOnTouchListener(new View.OnTouchListener() {
            float sx, sy; int ox, oy; boolean moved;
            @Override public boolean onTouch(View v, MotionEvent e) {
                switch (e.getAction()) {
                    case MotionEvent.ACTION_DOWN: sx = e.getRawX(); sy = e.getRawY(); ox = lp.x; oy = lp.y; moved = false; return true;
                    case MotionEvent.ACTION_MOVE:
                        float dx = e.getRawX() - sx, dy = e.getRawY() - sy;
                        if (moved || Math.hypot(dx, dy) > dp(12) * 0.75) { // ~12px drag threshold
                            moved = true;
                            int w = getResources().getDisplayMetrics().widthPixels, h = getResources().getDisplayMetrics().heightPixels;
                            lp.x = Math.max(0, Math.min(w - dp(56), (int) (ox + dx)));
                            lp.y = Math.max(0, Math.min(h - dp(56), (int) (oy + dy)));
                            wm.updateViewLayout(bubble, lp);
                        }
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (moved) {
                            int w = getResources().getDisplayMetrics().widthPixels;
                            lp.x = lp.x < w / 2 ? 0 : w - dp(56); // edge snap
                            wm.updateViewLayout(bubble, lp);
                            sp.edit().putInt("x", lp.x).putInt("y", lp.y).apply();
                            justDragged = System.currentTimeMillis();
                        } else if (System.currentTimeMillis() - justDragged > 250) togglePop();
                        return true;
                }
                return false;
            }
        });
        wm.addView(bubble, lp);
    }

    private void togglePop() {
        if (pop != null) { closePop(); return; }
        pop = new LinearLayout(this);
        pop.setOrientation(LinearLayout.VERTICAL);
        pop.setPadding(dp(8), dp(8), dp(8), dp(8));
        GradientDrawable g = new GradientDrawable();
        g.setColor(Color.parseColor("#0F1624"));
        g.setStroke(dp(1), Color.parseColor("#FFD700"));
        g.setCornerRadius(dp(14));
        pop.setBackground(g);
        pop.addView(btn("Return to App", new Runnable() { public void run() { open(false); } }));
        pop.addView(btn("Talk to AI", new Runnable() { public void run() { open(true); } }));
        pop.addView(btn("Exit App", new Runnable() { public void run() { stopSelf(); } }));
        WindowManager.LayoutParams p = new WindowManager.LayoutParams(dp(190), WindowManager.LayoutParams.WRAP_CONTENT,
            Build.VERSION.SDK_INT >= 26 ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
        p.gravity = Gravity.TOP | Gravity.START;
        p.x = Math.max(0, lp.x - dp(60));
        p.y = lp.y + dp(60);
        wm.addView(pop, p);
    }

    private Button btn(String t, final Runnable r) {
        Button b = new Button(this);
        b.setText(t);
        b.setMinHeight(dp(44));
        b.setOnClickListener(new View.OnClickListener() { public void onClick(View v) { closePop(); r.run(); } });
        return b;
    }

    private void closePop() { if (pop != null) { wm.removeView(pop); pop = null; } }

    private void open(boolean talk) {
        Intent i = new Intent(this, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (talk) i.putExtra("talk", true);
        startActivity(i);
    }

    @Override
    public void onDestroy() {
        closePop();
        if (bubble != null) { wm.removeView(bubble); bubble = null; }
        super.onDestroy();
    }
}
