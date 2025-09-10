export interface Buoy {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  region: string;
  description?: string;
}

export const indianOceanBuoys: Buoy[] = [
  {
    id: "arabian-sea-1",
    name: "Arabian Sea Central",
    coordinates: [65.0, 20.0],
    region: "Arabian Sea",
    description: "Central Arabian Sea monitoring station"
  },
  {
    id: "arabian-sea-2", 
    name: "Arabian Sea North",
    coordinates: [60.0, 25.0],
    region: "Arabian Sea",
    description: "Northern Arabian Sea buoy"
  },
  {
    id: "bay-bengal-1",
    name: "Bay of Bengal Central",
    coordinates: [88.0, 18.0],
    region: "Bay of Bengal",
    description: "Central Bay of Bengal monitoring"
  },
  {
    id: "bay-bengal-2",
    name: "Bay of Bengal South",
    coordinates: [85.0, 12.0],
    region: "Bay of Bengal", 
    description: "Southern Bay of Bengal station"
  },
  {
    id: "equatorial-io-1",
    name: "Equatorial Indian Ocean",
    coordinates: [75.0, 0.0],
    region: "Equatorial Indian Ocean",
    description: "Equatorial monitoring buoy"
  },
  {
    id: "equatorial-io-2",
    name: "Equatorial IO East",
    coordinates: [85.0, -2.0],
    region: "Equatorial Indian Ocean",
    description: "Eastern equatorial station"
  },
  {
    id: "southern-io-1",
    name: "Southern Indian Ocean",
    coordinates: [70.0, -15.0],
    region: "Southern Indian Ocean",
    description: "Southern Indian Ocean monitoring"
  },
  {
    id: "western-io-1",
    name: "Western Indian Ocean",
    coordinates: [50.0, 10.0],
    region: "Western Indian Ocean",
    description: "Western Indian Ocean station"
  },
  {
    id: "andaman-sea-1",
    name: "Andaman Sea",
    coordinates: [95.0, 10.0],
    region: "Andaman Sea",
    description: "Andaman Sea monitoring buoy"
  },
  {
    id: "laccadive-1",
    name: "Laccadive Sea",
    coordinates: [72.0, 8.0],
    region: "Laccadive Sea",
    description: "Laccadive Sea monitoring station"
  }
];

// TODO: Add dynamic buoy data loading from API
// TODO: Add buoy clustering/grouping functionality
// TODO: Add region-focused map variants
