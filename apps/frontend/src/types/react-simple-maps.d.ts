declare module 'react-simple-maps' {
  import { Component, ReactNode } from 'react';

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (args: { geographies: Array<{ rsmKey: string; [key: string]: unknown }> }) => ReactNode;
  }

  interface GeographyProps {
    geography: unknown;
    style?: Record<string, unknown>;
    className?: string;
    [key: string]: unknown;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }

  export class ComposableMap extends Component<ComposableMapProps> {}
  export class Geographies extends Component<GeographiesProps> {}
  export class Geography extends Component<GeographyProps> {}
  export class Marker extends Component<MarkerProps> {}
}
