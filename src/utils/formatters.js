/**
 * Locale-aware formatting utilities.
 * Pass i18n.language from useTranslation() as the locale parameter.
 */

export const formatDate = (date, locale) => {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return String(date);
  }
};

export const formatCurrency = (amount, currency = 'SAR', locale) => {
  if (amount === null || amount === undefined) return '-';
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export const formatNumber = (num, locale) => {
  if (num === null || num === undefined) return '-';
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(num);
  } catch {
    return String(num);
  }
};

export const formatRelativeTime = (date, locale) => {
  if (!date) return '-';
  try {
    const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { numeric: 'auto' });
    const diff = (new Date(date) - new Date()) / 1000;
    if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  } catch {
    return formatDate(date, locale);
  }
};
