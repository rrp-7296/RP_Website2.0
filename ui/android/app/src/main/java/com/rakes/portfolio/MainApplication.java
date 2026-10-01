package com.rakes.portfolio;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.os.Build;

/**
 * Custom Application class to create notification channels at app startup.
 * This ensures the "admin_alerts" channel exists BEFORE any FCM message arrives,
 * which is critical for background/closed-app push notifications on Android 8.0+.
 */
public class MainApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // Primary admin alerts channel — used by FCM background notifications
            NotificationChannel adminChannel = new NotificationChannel(
                "admin_alerts",
                "Admin System Alerts",
                NotificationManager.IMPORTANCE_HIGH
            );
            adminChannel.setDescription("Push notifications for messages, comments, likes & subscribers");
            adminChannel.enableVibration(true);
            adminChannel.setShowBadge(true);
            adminChannel.enableLights(true);
            adminChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);

            // Set default notification sound
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();
            adminChannel.setSound(
                android.provider.Settings.System.DEFAULT_NOTIFICATION_URI,
                audioAttributes
            );

            manager.createNotificationChannel(adminChannel);

            // Default fallback channel for any other notifications
            NotificationChannel defaultChannel = new NotificationChannel(
                "default",
                "General Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            defaultChannel.setDescription("General app notifications");
            manager.createNotificationChannel(defaultChannel);
        }
    }
}
