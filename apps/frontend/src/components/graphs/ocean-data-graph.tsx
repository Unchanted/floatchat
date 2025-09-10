"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "../../../../../packages/ui/src/components/card";
import { Button } from "../../../../../packages/ui/src/components/button";
import { Map as MapIcon, BarChart3, LineChart, Activity, Thermometer, Droplets, Gauge } from "lucide-react";

// Dynamically import Plot component to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export interface OceanDataPoint {
  LATITUDE: number;
  LONGITUDE: number;
  TIME: string;
  TEMP?: number;
  PSAL?: number;
  PRES?: number;
  [key: string]: any;
}

export interface GraphAnalysis {
  recommended_visualization: string;
  reasoning: string;
  available_visualizations: string[];
  data_insights: string[];
  data_summary?: {
    total_points: number;
    unique_locations: number;
    variables: string[];
    time_range: string;
  };
}

interface OceanDataGraphProps {
  data: OceanDataPoint[];
  queryMeta?: any;
  graphAnalysis?: GraphAnalysis;
}

type VisualizationType = 
  | "map" 
  | "temperature_map" 
  | "salinity_map" 
  | "pressure_map" 
  | "time_series" 
  | "scatter_plot"
  | "histogram";

export function OceanDataGraph({ data, queryMeta, graphAnalysis }: OceanDataGraphProps) {
  const [activeViz, setActiveViz] = React.useState<VisualizationType>("map");

  // Determine available visualizations based on data
  const availableVisualizations = useMemo(() => {
    if (!data || data.length === 0) return ["map"];
    
    const viz: VisualizationType[] = ["map"];
    const hasTemp = data.some(d => d.TEMP !== undefined && d.TEMP !== null);
    const hasSalinity = data.some(d => d.PSAL !== undefined && d.PSAL !== null);
    const hasPressure = data.some(d => d.PRES !== undefined && d.PRES !== null);
    const hasTime = data.some(d => d.TIME);
    
    if (hasTemp) viz.push("temperature_map");
    if (hasSalinity) viz.push("salinity_map");
    if (hasPressure) viz.push("pressure_map");
    if (hasTime && data.length > 1) viz.push("time_series");
    if (data.length > 1) viz.push("scatter_plot", "histogram");
    
    return viz;
  }, [data]);

  // Set initial visualization based on graph analysis or data
  React.useEffect(() => {
    if (graphAnalysis?.recommended_visualization) {
      const recommended = graphAnalysis.recommended_visualization as VisualizationType;
      if (availableVisualizations.includes(recommended)) {
        setActiveViz(recommended);
      }
    }
  }, [graphAnalysis, availableVisualizations]);

  const getVizIcon = (viz: VisualizationType) => {
    switch (viz) {
      case "map": return <MapIcon className="h-4 w-4" />;
      case "temperature_map": return <Thermometer className="h-4 w-4" />;
      case "salinity_map": return <Droplets className="h-4 w-4" />;
      case "pressure_map": return <Gauge className="h-4 w-4" />;
      case "time_series": return <LineChart className="h-4 w-4" />;
      case "scatter_plot": return <Activity className="h-4 w-4" />;
      case "histogram": return <BarChart3 className="h-4 w-4" />;
      default: return <MapIcon className="h-4 w-4" />;
    }
  };

  const getVizLabel = (viz: VisualizationType) => {
    switch (viz) {
      case "map": return "Location Map";
      case "temperature_map": return "Temperature Map";
      case "salinity_map": return "Salinity Map";
      case "pressure_map": return "Pressure Map";
      case "time_series": return "Time Series";
      case "scatter_plot": return "Scatter Plot";
      case "histogram": return "Distribution";
      default: return "Map";
    }
  };

  const renderVisualization = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <MapIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available for visualization</p>
          </div>
        </div>
      );
    }

    switch (activeViz) {
      case "map":
        return <LocationMap data={data} queryMeta={queryMeta} />;
      case "temperature_map":
        return <TemperatureMap data={data} queryMeta={queryMeta} />;
      case "salinity_map":
        return <SalinityMap data={data} queryMeta={queryMeta} />;
      case "pressure_map":
        return <PressureMap data={data} queryMeta={queryMeta} />;
      case "time_series":
        return <TimeSeriesChart data={data} queryMeta={queryMeta} />;
      case "scatter_plot":
        return <ScatterPlot data={data} queryMeta={queryMeta} />;
      case "histogram":
        return <HistogramChart data={data} queryMeta={queryMeta} />;
      default:
        return <LocationMap data={data} queryMeta={queryMeta} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Visualization Controls */}
      <div className="flex flex-wrap gap-2">
        {availableVisualizations.map((viz) => (
          <Button
            key={viz}
            variant={activeViz === viz ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveViz(viz)}
            className="flex items-center gap-2"
          >
            {getVizIcon(viz)}
            {getVizLabel(viz)}
          </Button>
        ))}
      </div>

      {/* Graph Analysis Info */}
      {graphAnalysis && (
        <Card className="p-4 bg-muted/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium">Recommended: {getVizLabel(activeViz)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{graphAnalysis.reasoning}</p>
            {graphAnalysis.data_insights && graphAnalysis.data_insights.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <strong>Insights:</strong> {graphAnalysis.data_insights.join(" • ")}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Visualization */}
      <Card className="p-4">
        {renderVisualization()}
      </Card>
    </div>
  );
}

// Individual visualization components
function LocationMap({ data, queryMeta }: { data: OceanDataPoint[]; queryMeta?: any }) {
  const plotData = useMemo(() => {
    const uniqueLocations = data.reduce((acc, point) => {
      const key = `${point.LATITUDE},${point.LONGITUDE}`;
      if (!acc.has(key)) {
        acc.set(key, point);
      }
      return acc;
    }, new Map());

    const locations = Array.from(uniqueLocations.values());

    return [{
      type: "scattermapbox",
      mode: "markers",
      lat: locations.map(d => d.LATITUDE),
      lon: locations.map(d => d.LONGITUDE),
      text: locations.map(d => 
        `Location: ${d.LATITUDE.toFixed(2)}°N, ${d.LONGITUDE.toFixed(2)}°E<br>` +
        `Time: ${new Date(d.TIME).toLocaleDateString()}<br>` +
        `Temperature: ${d.TEMP ? d.TEMP.toFixed(2) + '°C' : 'N/A'}<br>` +
        `Salinity: ${d.PSAL ? d.PSAL.toFixed(2) + ' PSU' : 'N/A'}`
      ),
      hovertemplate: "%{text}<extra></extra>",
      marker: {
        size: 8,
        color: "#3b82f6",
        opacity: 0.8
      },
      name: "Argo Float Locations"
    }];
  }, [data]);

  const layout = {
    mapbox: {
      style: "open-street-map",
      center: {
        lat: data.length > 0 ? data[0].LATITUDE : 0,
        lon: data.length > 0 ? data[0].LONGITUDE : 0
      },
      zoom: 6
    },
    title: "Argo Float Locations",
    showlegend: false,
    margin: { t: 40, r: 0, b: 0, l: 0 },
    height: 400
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

function TemperatureMap({ data, queryMeta }: { data: OceanDataPoint[]; queryMeta?: any }) {
  const plotData = useMemo(() => {
    const tempData = data.filter(d => d.TEMP !== undefined && d.TEMP !== null);
    
    return [{
      type: "scattermapbox",
      mode: "markers",
      lat: tempData.map(d => d.LATITUDE),
      lon: tempData.map(d => d.LONGITUDE),
      text: tempData.map(d => 
        `Temperature: ${d.TEMP!.toFixed(2)}°C<br>` +
        `Location: ${d.LATITUDE.toFixed(2)}°N, ${d.LONGITUDE.toFixed(2)}°E<br>` +
        `Time: ${new Date(d.TIME).toLocaleDateString()}`
      ),
      hovertemplate: "%{text}<extra></extra>",
      marker: {
        size: 10,
        color: tempData.map(d => d.TEMP!),
        colorscale: "RdYlBu_r",
        colorbar: {
          title: "Temperature (°C)",
          titleside: "right"
        },
        opacity: 0.8
      },
      name: "Temperature"
    }];
  }, [data]);

  const layout = {
    mapbox: {
      style: "open-street-map",
      center: {
        lat: data.length > 0 ? data[0].LATITUDE : 0,
        lon: data.length > 0 ? data[0].LONGITUDE : 0
      },
      zoom: 6
    },
    title: "Ocean Temperature Distribution",
    showlegend: false,
    margin: { t: 40, r: 0, b: 0, l: 0 },
    height: 400
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

function SalinityMap({ data, queryMeta }: { data: OceanDataPoint[]; queryMeta?: any }) {
  const plotData = useMemo(() => {
    const salinityData = data.filter(d => d.PSAL !== undefined && d.PSAL !== null);
    
    return [{
      type: "scattermapbox",
      mode: "markers",
      lat: salinityData.map(d => d.LATITUDE),
      lon: salinityData.map(d => d.LONGITUDE),
      text: salinityData.map(d => 
        `Salinity: ${d.PSAL!.toFixed(2)} PSU<br>` +
        `Location: ${d.LATITUDE.toFixed(2)}°N, ${d.LONGITUDE.toFixed(2)}°E<br>` +
        `Time: ${new Date(d.TIME).toLocaleDateString()}`
      ),
      hovertemplate: "%{text}<extra></extra>",
      marker: {
        size: 10,
        color: salinityData.map(d => d.PSAL!),
        colorscale: "Blues",
        colorbar: {
          title: "Salinity (PSU)",
          titleside: "right"
        },
        opacity: 0.8
      },
      name: "Salinity"
    }];
  }, [data]);

  const layout = {
    mapbox: {
      style: "open-street-map",
      center: {
        lat: data.length > 0 ? data[0].LATITUDE : 0,
        lon: data.length > 0 ? data[0].LONGITUDE : 0
      },
      zoom: 6
    },
    title: "Ocean Salinity Distribution",
    showlegend: false,
    margin: { t: 40, r: 0, b: 0, l: 0 },
    height: 400
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

function PressureMap({ data, queryMeta }: { data: OceanDataPoint[]; queryMeta?: any }) {
  const plotData = useMemo(() => {
    const pressureData = data.filter(d => d.PRES !== undefined && d.PRES !== null);
    
    return [{
      type: "scattermapbox",
      mode: "markers",
      lat: pressureData.map(d => d.LATITUDE),
      lon: pressureData.map(d => d.LONGITUDE),
      text: pressureData.map(d => 
        `Pressure: ${d.PRES!.toFixed(1)} dbar<br>` +
        `Location: ${d.LATITUDE.toFixed(2)}°N, ${d.LONGITUDE.toFixed(2)}°E<br>` +
        `Time: ${new Date(d.TIME).toLocaleDateString()}`
      ),
      hovertemplate: "%{text}<extra></extra>",
      marker: {
        size: 10,
        color: pressureData.map(d => d.PRES!),
        colorscale: "Viridis",
        colorbar: {
          title: "Pressure (dbar)",
          titleside: "right"
        },
        opacity: 0.8
      },
      name: "Pressure"
    }];
  }, [data]);

  const layout = {
    mapbox: {
      style: "open-street-map",
      center: {
        lat: data.length > 0 ? data[0].LATITUDE : 0,
        lon: data.length > 0 ? data[0].LONGITUDE : 0
      },
      zoom: 6
    },
    title: "Ocean Pressure Distribution",
    showlegend: false,
    margin: { t: 40, r: 0, b: 0, l: 0 },
    height: 400
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

function TimeSeriesChart({ data, queryMeta }: { data: OceanDataPoint[]; queryMeta?: any }) {
  const plotData = useMemo(() => {
    const timeData = data
      .filter(d => d.TIME && d.TEMP !== undefined && d.TEMP !== null)
      .sort((a, b) => new Date(a.TIME).getTime() - new Date(b.TIME).getTime());

    return [{
      type: "scatter",
      mode: "lines+markers",
      x: timeData.map(d => d.TIME),
      y: timeData.map(d => d.TEMP!),
      text: timeData.map(d => 
        `Temperature: ${d.TEMP!.toFixed(2)}°C<br>` +
        `Location: ${d.LATITUDE.toFixed(2)}°N, ${d.LONGITUDE.toFixed(2)}°E`
      ),
      hovertemplate: "%{text}<extra></extra>",
      line: { color: "#ef4444" },
      marker: { size: 6 },
      name: "Temperature"
    }];
  }, [data]);

  const layout = {
    title: "Temperature Over Time",
    xaxis: { title: "Time" },
    yaxis: { title: "Temperature (°C)" },
    margin: { t: 40, r: 20, b: 40, l: 60 },
    height: 400
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

function ScatterPlot({ data, queryMeta }: { data: OceanDataPoint[]; queryMeta?: any }) {
  const plotData = useMemo(() => {
    const scatterData = data.filter(d => d.TEMP !== undefined && d.PSAL !== undefined && d.TEMP !== null && d.PSAL !== null);
    
    return [{
      type: "scatter",
      mode: "markers",
      x: scatterData.map(d => d.TEMP!),
      y: scatterData.map(d => d.PSAL!),
      text: scatterData.map(d => 
        `Temperature: ${d.TEMP!.toFixed(2)}°C<br>` +
        `Salinity: ${d.PSAL!.toFixed(2)} PSU<br>` +
        `Location: ${d.LATITUDE.toFixed(2)}°N, ${d.LONGITUDE.toFixed(2)}°E`
      ),
      hovertemplate: "%{text}<extra></extra>",
      marker: {
        size: 8,
        color: "#3b82f6",
        opacity: 0.7
      },
      name: "T-S Relationship"
    }];
  }, [data]);

  const layout = {
    title: "Temperature-Salinity Relationship",
    xaxis: { title: "Temperature (°C)" },
    yaxis: { title: "Salinity (PSU)" },
    margin: { t: 40, r: 20, b: 40, l: 60 },
    height: 400
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

function HistogramChart({ data, queryMeta }: { data: OceanDataPoint[]; queryMeta?: any }) {
  const plotData = useMemo(() => {
    const tempData = data.filter(d => d.TEMP !== undefined && d.TEMP !== null).map(d => d.TEMP!);
    
    return [{
      type: "histogram",
      x: tempData,
      nbinsx: 20,
      marker: {
        color: "#3b82f6",
        opacity: 0.7
      },
      name: "Temperature Distribution"
    }];
  }, [data]);

  const layout = {
    title: "Temperature Distribution",
    xaxis: { title: "Temperature (°C)" },
    yaxis: { title: "Frequency" },
    margin: { t: 40, r: 20, b: 40, l: 60 },
    height: 400
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}
