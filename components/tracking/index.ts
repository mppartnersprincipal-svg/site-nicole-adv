export { Analytics } from "./Analytics";
export { TrackingProvider } from "./TrackingProvider";
export { UTMCapture } from "./UTMCapture";
export { TrackingEvents } from "./TrackingEvents";
export { ConsentBanner } from "./ConsentBanner";
export {
  trackEvent,
  trackEventAndWait,
  getAttribution,
  openConsentPreferences,
  readConsent,
  saveConsent,
} from "@/lib/tracking";
export type { Attribution, ConsentState, TrackParams, Touch } from "@/lib/tracking";
