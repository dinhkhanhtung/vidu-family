// Google Analytics 4 và các công cụ phân tích khác
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Khởi tạo Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;

  // Tải script GA
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Khởi tạo dataLayer và gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
  });
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track user actions
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  trackEvent(action, 'user_interaction', undefined, details?.value);
};

// Track errors
export const trackError = (error: Error, errorInfo?: Record<string, any>) => {
  trackEvent('exception', 'error', error.message, errorInfo?.fatal ? 1 : 0);
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number, unit: string) => {
  trackEvent(metric, 'performance', `${value} ${unit}`);
};

// Track business metrics
export const trackBusinessMetric = (
  metric: string,
  value: number,
  currency?: string
) => {
  trackEvent(metric, 'business', currency, value);
};

// Analytics object for middleware compatibility
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      trackEvent(event, 'middleware', JSON.stringify(properties));
    }
  },
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      trackUserAction('user_identify', { userId, ...traits });
    }
  },
};
