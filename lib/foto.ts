/** Formato mínimo de foto consumido pelos componentes visuais. */
export interface FotoSite {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL?: string;
  srcMobile?: string;
}
