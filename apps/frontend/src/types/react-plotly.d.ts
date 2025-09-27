declare module 'react-plotly.js' {
  import { Component } from 'react';
  
  interface PlotProps {
    data: unknown[];
    layout?: Record<string, unknown>;
    config?: Record<string, unknown>;
    style?: React.CSSProperties;
    className?: string;
    [key: string]: unknown;
  }

  export default class Plot extends Component<PlotProps> {}
}
