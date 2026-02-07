export interface Theme {
  id: number; // auto-generated in Kotlin DB
  name: string;

  // Color scheme
  primaryColor: string;
  primaryVariantColor?: string | null;
  secondaryColor: string;
  secondaryVariantColor?: string | null;
  backgroundColor: string;
  surfaceColor: string;
  errorColor: string;
  onPrimaryColor: string;
  onSecondaryColor: string;
  onBackgroundColor: string;
  onSurfaceColor: string;
  onErrorColor: string;

  // Typography
  fontFamily?: string | null;
  headlineLargeSize?: number | null;
  headlineMediumSize?: number | null;
  headlineSmallSize?: number | null;
  bodyLargeSize?: number | null;
  bodyMediumSize?: number | null;
  bodySmallSize?: number | null;
  labelLargeSize?: number | null;
  labelMediumSize?: number | null;
  labelSmallSize?: number | null;
  fontWeightNormal?: number | null;   // e.g. 400
  fontWeightMedium?: number | null;   // e.g. 500
  fontWeightBold?: number | null;     // e.g. 700

  // Shapes (optional)
  cornerSmall?: number | null;      // dp
  cornerMedium?: number | null;     // dp
  cornerLarge?: number | null;      // dp

  // Other optional UI theme settings
  isDarkTheme: boolean;
  customFontUrl?: string | null;    // URL for downloading a font if provided by server
}
