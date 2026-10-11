import type messages from '../../messages/en.json';
import type { Locale } from './config';
import type { formats } from './formats';

declare module 'next-intl' {
    interface AppConfig {
        Locale: Locale;
        Messages: typeof messages;
        Formats: typeof formats;
    }
}
