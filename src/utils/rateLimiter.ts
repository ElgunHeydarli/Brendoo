/**
 * Rate Limiting Utility
 * API istəklərini məhdudlaşdırmaq üçün
 */

interface RateLimitConfig {
  maxRequests: number; // Maksimum sorğu sayı
  timeWindow: number; // Vaxt pəncərəsi (ms)
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 100, timeWindow: 60000 }) {
    this.config = config;
  }

  /**
   * Sorğuya icazə verilməsini yoxlayır
   */
  public canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const record = this.requests.get(endpoint);

    if (!record) {
      // İlk sorğu
      this.requests.set(endpoint, {
        count: 1,
        resetTime: now + this.config.timeWindow,
      });
      return true;
    }

    if (now > record.resetTime) {
      // Vaxt pəncərəsi bitib, reset et
      this.requests.set(endpoint, {
        count: 1,
        resetTime: now + this.config.timeWindow,
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      // Limit keçilib
      return false;
    }

    // Sayı artır
    record.count++;
    return true;
  }

  /**
   * Müəyyən endpoint üçün limitə nə qədər vaxt qalıb (ms)
   */
  public getTimeUntilReset(endpoint: string): number {
    const record = this.requests.get(endpoint);
    if (!record) return 0;

    const now = Date.now();
    const remaining = record.resetTime - now;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Müəyyən endpoint üçün qalan sorğu sayı
   */
  public getRemainingRequests(endpoint: string): number {
    const record = this.requests.get(endpoint);
    if (!record) return this.config.maxRequests;

    const now = Date.now();
    if (now > record.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  /**
   * Bütün limitləri sıfırla
   */
  public reset(): void {
    this.requests.clear();
  }

  /**
   * Müəyyən endpoint üçün limiti sıfırla
   */
  public resetEndpoint(endpoint: string): void {
    this.requests.delete(endpoint);
  }
}

// Singleton instance
export const globalRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 sorğu
  timeWindow: 60000, // 1 dəqiqə
});

// Daha ciddi limitlər üçün ayrıca instance
export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 sorğu
  timeWindow: 60000, // 1 dəqiqə (login, register, password reset üçün)
});

/**
 * Throttle funksiyası - funksiyanı müəyyən interval ilə çağırmağa icazə verir
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func.apply(this, args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce funksiyası - funksiya çağırışlarını gecikdirir
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default RateLimiter;
