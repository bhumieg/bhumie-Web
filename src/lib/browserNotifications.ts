// Browser Native Notifications & Melodic Chime Audio Utility

class BrowserNotificationManager {
  private audioCtx: AudioContext | null = null;

  // Synthesize a pleasant 2-tone melodic notification chime using Web Audio API
  playNotificationSound() {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'suspended') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Tone 1: Note E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: Note A5 (880.00 Hz) - slightly delayed for pleasant bell chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } catch {
      // Audio autoplay policy or browser unsupported, fail silently
    }
  }

  // Check if browser supports notification API
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Request user permission for notifications
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      // Prime audio context on user interaction
      this.playNotificationSound();

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  // Send a system desktop/phone push notification with sound
  sendNotification({
    title,
    body,
    icon = '/favicon.ico',
    tag,
    onClick,
  }: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }) {
    // 1. Play chime sound
    this.playNotificationSound();

    // 2. Fire system push notification if permitted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon,
          badge: icon,
          tag: tag || 'bhumie-chat',
        });

        if (onClick) {
          notif.onclick = () => {
            window.focus();
            onClick();
            notif.close();
          };
        }
      } catch {
        // Fallback for mobile browsers or restrictive environments
      }
    }
  }
}

export const notificationManager = new BrowserNotificationManager();
