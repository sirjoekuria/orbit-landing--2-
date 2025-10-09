import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Search, X, ArrowDown } from "lucide-react";
import MapboxMap from "./MapboxMap";

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  onLocationSelect: (pickup: Location, dropoff: Location) => void;
  onDistanceCalculated?: (distance: number, duration: number) => void;
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
}

const MAPBOX_ACCESS_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
  "pk.eyJ1Ijoic2lyam9la3VyaWEiLCJhIjoiY21laGxzZnI0MDBjZzJqcXczc2NtdHZqZCJ9.FhRc9jUcHnkTPuauJrP-Qw";

// Comprehensive Kenyan landmarks and buildings database
const KENYAN_LANDMARKS: SearchResult[] = [
  // Major Malls
  {
    id: "westgate-mall",
    place_name: "Westgate Shopping Mall, Westlands, Nairobi",
    center: [36.8065, -1.2676],
    text: "Westgate Mall",
  },
  {
    id: "junction-mall",
    place_name: "Junction Mall, Ngong Road, Nairobi",
    center: [36.7819, -1.3019],
    text: "Junction Mall",
  },
  {
    id: "sarit-centre",
    place_name: "Sarit Centre, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Sarit Centre",
  },
  {
    id: "village-market",
    place_name: "Village Market, Gigiri, Nairobi",
    center: [36.815, -1.243],
    text: "Village Market",
  },
  {
    id: "galleria-mall",
    place_name: "Galleria Shopping Mall, Langata Road, Nairobi",
    center: [36.765, -1.335],
    text: "Galleria Mall",
  },
  {
    id: "thika-road-mall",
    place_name: "Thika Road Mall, Roysambu, Nairobi",
    center: [36.8833, -1.2167],
    text: "Thika Road Mall",
  },
  {
    id: "garden-city-mall",
    place_name: "Garden City Mall, Thika Road, Nairobi",
    center: [36.895, -1.21],
    text: "Garden City Mall",
  },
  {
    id: "yaya-centre",
    place_name: "Yaya Centre, Kilimani, Nairobi",
    center: [36.785, -1.295],
    text: "Yaya Centre",
  },
  {
    id: "prestige-plaza",
    place_name: "Prestige Plaza, Ngong Road, Nairobi",
    center: [36.77, -1.32],
    text: "Prestige Plaza",
  },
  {
    id: "nextgen-mall",
    place_name: "NextGen Mall, Mombasa Road, Nairobi",
    center: [36.84, -1.34],
    text: "NextGen Mall",
  },

  // Government Buildings & Landmarks
  {
    id: "kicc",
    place_name: "Kenyatta International Conference Centre (KICC), CBD, Nairobi",
    center: [36.8172, -1.2873],
    text: "KICC",
  },
  {
    id: "parliament",
    place_name: "Parliament Buildings, CBD, Nairobi",
    center: [36.8181, -1.2884],
    text: "Parliament Buildings",
  },
  {
    id: "state-house",
    place_name: "State House, Nairobi",
    center: [36.805, -1.27],
    text: "State House",
  },
  {
    id: "city-hall",
    place_name: "City Hall, CBD, Nairobi",
    center: [36.8172, -1.2864],
    text: "City Hall",
  },
  {
    id: "nyayo-house",
    place_name: "Nyayo House, Uhuru Highway, Nairobi",
    center: [36.8181, -1.289],
    text: "Nyayo House",
  },
  {
    id: "anniversary-towers",
    place_name: "Anniversary Towers, University Way, Nairobi",
    center: [36.8181, -1.287],
    text: "Anniversary Towers",
  },

  // Hotels
  {
    id: "hilton-nairobi",
    place_name: "Hilton Nairobi, Mama Ngina Street, CBD, Nairobi",
    center: [36.8181, -1.2864],
    text: "Hilton Hotel",
  },
  {
    id: "serena-hotel",
    place_name: "Serena Hotel, Kenyatta Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Serena Hotel",
  },
  {
    id: "sankara-hotel",
    place_name: "Sankara Nairobi, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Sankara Hotel",
  },
  {
    id: "villa-rosa-kempinski",
    place_name: "Villa Rosa Kempinski, Chiromo Road, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Villa Rosa Kempinski",
  },
  {
    id: "intercontinental",
    place_name: "InterContinental Nairobi, City Hall Way, CBD, Nairobi",
    center: [36.8181, -1.2864],
    text: "InterContinental Hotel",
  },

  // Hospitals
  {
    id: "knh",
    place_name: "Kenyatta National Hospital, Hospital Road, Nairobi",
    center: [36.805, -1.3],
    text: "Kenyatta National Hospital",
  },
  {
    id: "nairobi-hospital",
    place_name: "Nairobi Hospital, Argwings Kodhek Road, Nairobi",
    center: [36.785, -1.295],
    text: "Nairobi Hospital",
  },
  {
    id: "aga-khan-hospital",
    place_name: "Aga Khan University Hospital, Third Parklands Avenue, Nairobi",
    center: [36.82, -1.26],
    text: "Aga Khan Hospital",
  },
  {
    id: "mater-hospital",
    place_name: "Mater Hospital, South B, Nairobi",
    center: [36.83, -1.31],
    text: "Mater Hospital",
  },

  // Universities
  {
    id: "university-of-nairobi",
    place_name: "University of Nairobi, Harry Thuku Road, Nairobi",
    center: [36.8181, -1.279],
    text: "University of Nairobi",
  },
  {
    id: "strathmore-university",
    place_name: "Strathmore University, Ole Sangale Road, Madaraka, Nairobi",
    center: [36.795, -1.305],
    text: "Strathmore University",
  },
  {
    id: "usiu",
    place_name:
      "United States International University (USIU), Thika Road, Kasarani, Nairobi",
    center: [36.89, -1.22],
    text: "USIU",
  },
  {
    id: "daystar-university",
    place_name: "Daystar University, Athi River Campus, Machakos",
    center: [36.98, -1.45],
    text: "Daystar University",
  },

  // Business Districts & Areas
  {
    id: "cbd",
    place_name: "Central Business District (CBD), Nairobi",
    center: [36.8172, -1.2864],
    text: "CBD",
  },
  {
    id: "westlands",
    place_name: "Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Westlands",
  },
  {
    id: "karen",
    place_name: "Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen",
  },
  {
    id: "kilimani",
    place_name: "Kilimani, Nairobi",
    center: [36.7833, -1.2833],
    text: "Kilimani",
  },
  {
    id: "kileleshwa",
    place_name: "Kileleshwa, Nairobi",
    center: [36.7833, -1.2833],
    text: "Kileleshwa",
  },
  {
    id: "eastleigh",
    place_name: "Eastleigh, Nairobi",
    center: [36.85, -1.2833],
    text: "Eastleigh",
  },
  {
    id: "kasarani",
    place_name: "Kasarani, Nairobi",
    center: [36.9, -1.2167],
    text: "Kasarani",
  },
  {
    id: "embakasi",
    place_name: "Embakasi, Nairobi",
    center: [36.8833, -1.3167],
    text: "Embakasi",
  },
  {
    id: "south-b",
    place_name: "South B, Nairobi",
    center: [36.83, -1.31],
    text: "South B",
  },
  {
    id: "south-c",
    place_name: "South C, Nairobi",
    center: [36.835, -1.315],
    text: "South C",
  },

  // Transport Hubs
  {
    id: "jkia",
    place_name: "Jomo Kenyatta International Airport (JKIA), Nairobi",
    center: [36.9275, -1.3192],
    text: "JKIA Airport",
  },
  {
    id: "wilson-airport",
    place_name: "Wilson Airport, Langata Road, Nairobi",
    center: [36.815, -1.322],
    text: "Wilson Airport",
  },
  {
    id: "railway-station",
    place_name: "Nairobi Railway Station, Station Road, CBD, Nairobi",
    center: [36.8181, -1.289],
    text: "Railway Station",
  },
  {
    id: "bus-station",
    place_name: "Nairobi Bus Station, Accra Road, CBD, Nairobi",
    center: [36.8181, -1.289],
    text: "Bus Station",
  },

  // Office Buildings
  {
    id: "iim-building",
    place_name: "I&M Building, Kenyatta Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "I&M Building",
  },
  {
    id: "kcb-building",
    place_name: "KCB Building, Kencom House, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "KCB Building",
  },
  {
    id: "uap-building",
    place_name: "UAP Old Mutual Building, Upper Hill, Nairobi",
    center: [36.805, -1.295],
    text: "UAP Building",
  },
  {
    id: "kencom-house",
    place_name: "Kencom House, Moi Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Kencom House",
  },
  {
    id: "times-tower",
    place_name: "Times Tower, Haile Selassie Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Times Tower",
  },

  // Entertainment & Leisure
  {
    id: "uhuru-park",
    place_name: "Uhuru Park, CBD, Nairobi",
    center: [36.8181, -1.289],
    text: "Uhuru Park",
  },
  {
    id: "central-park",
    place_name: "Central Park, CBD, Nairobi",
    center: [36.8181, -1.2864],
    text: "Central Park",
  },
  {
    id: "karura-forest",
    place_name: "Karura Forest, Kiambu Road, Nairobi",
    center: [36.85, -1.23],
    text: "Karura Forest",
  },
  {
    id: "nairobi-national-park",
    place_name: "Nairobi National Park, Langata, Nairobi",
    center: [36.8, -1.35],
    text: "Nairobi National Park",
  },

  // Sports Venues
  {
    id: "kasarani-stadium",
    place_name: "Moi International Sports Centre Kasarani, Thika Road, Nairobi",
    center: [36.9, -1.2167],
    text: "Kasarani Stadium",
  },
  {
    id: "nyayo-stadium",
    place_name: "Nyayo National Stadium, Langata Road, Nairobi",
    center: [36.8, -1.32],
    text: "Nyayo Stadium",
  },

  // Major Apartment Complexes & Residential Buildings

  // Westlands Area Apartments
  {
    id: "brookside-drive",
    place_name: "Brookside Drive Apartments, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Brookside Drive",
  },
  {
    id: "mvuli-suites",
    place_name: "Mvuli Suites, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Mvuli Suites",
  },
  {
    id: "westlands-square",
    place_name: "Westlands Square Apartments, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Westlands Square",
  },
  {
    id: "woodvale-grove",
    place_name: "Woodvale Grove Apartments, Westlands, Nairobi",
    center: [36.815, -1.265],
    text: "Woodvale Grove",
  },
  {
    id: "crystal-rivers",
    place_name: "Crystal Rivers Apartments, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Crystal Rivers",
  },

  // Kilimani Area Apartments
  {
    id: "delta-towers",
    place_name: "Delta Towers, Kilimani, Nairobi",
    center: [36.7833, -1.29],
    text: "Delta Towers",
  },
  {
    id: "chaka-place",
    place_name: "Chaka Place Apartments, Kilimani, Nairobi",
    center: [36.785, -1.295],
    text: "Chaka Place",
  },
  {
    id: "yaya-towers",
    place_name: "Yaya Towers, Kilimani, Nairobi",
    center: [36.785, -1.295],
    text: "Yaya Towers",
  },
  {
    id: "view-park-towers",
    place_name: "View Park Towers, Kilimani, Nairobi",
    center: [36.7833, -1.29],
    text: "View Park Towers",
  },
  {
    id: "kilimani-square",
    place_name: "Kilimani Square Apartments, Kilimani, Nairobi",
    center: [36.7833, -1.29],
    text: "Kilimani Square",
  },
  {
    id: "rose-avenue",
    place_name: "Rose Avenue Apartments, Kilimani, Nairobi",
    center: [36.785, -1.295],
    text: "Rose Avenue",
  },

  // Kileleshwa Area Apartments
  {
    id: "wood-avenue",
    place_name: "Wood Avenue Apartments, Kileleshwa, Nairobi",
    center: [36.7833, -1.2833],
    text: "Wood Avenue",
  },
  {
    id: "kileleshwa-apartments",
    place_name: "Kileleshwa Apartments, Kileleshwa, Nairobi",
    center: [36.7833, -1.2833],
    text: "Kileleshwa Apartments",
  },
  {
    id: "muthaiga-north",
    place_name: "Muthaiga North Apartments, Kileleshwa, Nairobi",
    center: [36.79, -1.28],
    text: "Muthaiga North",
  },

  // Upper Hill Area Apartments
  {
    id: "upperhill-towers",
    place_name: "Upper Hill Towers, Upper Hill, Nairobi",
    center: [36.805, -1.295],
    text: "Upper Hill Towers",
  },
  {
    id: "rahimtulla-tower",
    place_name: "Rahimtulla Tower, Upper Hill, Nairobi",
    center: [36.805, -1.295],
    text: "Rahimtulla Tower",
  },
  {
    id: "elgon-view",
    place_name: "Elgon View Apartments, Upper Hill, Nairobi",
    center: [36.805, -1.295],
    text: "Elgon View",
  },

  // Lavington Area Apartments
  {
    id: "lavington-green",
    place_name: "Lavington Green Apartments, Lavington, Nairobi",
    center: [36.765, -1.28],
    text: "Lavington Green",
  },
  {
    id: "kyuna-close",
    place_name: "Kyuna Close Apartments, Lavington, Nairobi",
    center: [36.765, -1.28],
    text: "Kyuna Close",
  },
  {
    id: "kipande-gardens",
    place_name: "Kipande Gardens, Lavington, Nairobi",
    center: [36.765, -1.28],
    text: "Kipande Gardens",
  },

  // Parklands Area Apartments
  {
    id: "parklands-towers",
    place_name: "Parklands Towers, Parklands, Nairobi",
    center: [36.82, -1.26],
    text: "Parklands Towers",
  },
  {
    id: "aga-khan-walk",
    place_name: "Aga Khan Walk Apartments, Parklands, Nairobi",
    center: [36.82, -1.26],
    text: "Aga Khan Walk",
  },
  {
    id: "parkview-estate",
    place_name: "Parkview Estate, Parklands, Nairobi",
    center: [36.82, -1.26],
    text: "Parkview Estate",
  },

  // Riverside Area Apartments
  {
    id: "riverside-drive",
    place_name: "Riverside Drive Apartments, Riverside, Nairobi",
    center: [36.81, -1.27],
    text: "Riverside Drive",
  },
  {
    id: "cavendish-riverside",
    place_name: "Cavendish University Apartments, Riverside, Nairobi",
    center: [36.81, -1.27],
    text: "Cavendish Riverside",
  },
  {
    id: "riverside-towers",
    place_name: "Riverside Towers, Riverside, Nairobi",
    center: [36.81, -1.27],
    text: "Riverside Towers",
  },

  // South B & South C Apartments
  {
    id: "south-b-estate",
    place_name: "South B Estate, South B, Nairobi",
    center: [36.83, -1.31],
    text: "South B Estate",
  },
  {
    id: "akila-springs",
    place_name: "Akila Springs Apartments, South B, Nairobi",
    center: [36.83, -1.31],
    text: "Akila Springs",
  },
  {
    id: "south-c-apartments",
    place_name: "South C Apartments, South C, Nairobi",
    center: [36.835, -1.315],
    text: "South C Apartments",
  },
  {
    id: "valley-arcade",
    place_name: "Valley Arcade Apartments, Lavington, Nairobi",
    center: [36.765, -1.285],
    text: "Valley Arcade",
  },

  // Hurlingham Area Apartments
  {
    id: "hurlingham-shopping",
    place_name: "Hurlingham Shopping Centre Apartments, Hurlingham, Nairobi",
    center: [36.775, -1.295],
    text: "Hurlingham Shopping Centre",
  },
  {
    id: "argwings-kodhek",
    place_name: "Argwings Kodhek Road Apartments, Hurlingham, Nairobi",
    center: [36.78, -1.295],
    text: "Argwings Kodhek",
  },

  // Karen Area Apartments
  {
    id: "karen-estate",
    place_name: "Karen Estate, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen Estate",
  },
  {
    id: "karen-hardy",
    place_name: "Karen Hardy Estate, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen Hardy",
  },
  {
    id: "karen-country-club",
    place_name: "Karen Country Club Estate, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen Country Club",
  },

  // Langata Area Apartments
  {
    id: "langata-link",
    place_name: "Langata Link Apartments, Langata, Nairobi",
    center: [36.75, -1.35],
    text: "Langata Link",
  },
  {
    id: "ongata-rongai",
    place_name: "Ongata Rongai Apartments, Ongata Rongai, Kajiado",
    center: [36.74, -1.39],
    text: "Ongata Rongai",
  },

  // Eastlands Area Apartments
  {
    id: "eastleigh-estate",
    place_name: "Eastleigh Estate, Eastleigh, Nairobi",
    center: [36.85, -1.2833],
    text: "Eastleigh Estate",
  },
  {
    id: "california-estate",
    place_name: "California Estate, Eastleigh, Nairobi",
    center: [36.85, -1.2833],
    text: "California Estate",
  },
  {
    id: "buruburu-estate",
    place_name: "Buruburu Estate, Buruburu, Nairobi",
    center: [36.87, -1.29],
    text: "Buruburu Estate",
  },
  {
    id: "donholm-estate",
    place_name: "Donholm Estate, Donholm, Nairobi",
    center: [36.9, -1.27],
    text: "Donholm Estate",
  },
  {
    id: "umoja-estate",
    place_name: "Umoja Estate, Umoja, Nairobi",
    center: [36.89, -1.28],
    text: "Umoja Estate",
  },
  {
    id: "fedha-estate",
    place_name: "Fedha Estate, Embakasi, Nairobi",
    center: [36.8833, -1.3167],
    text: "Fedha Estate",
  },

  // Kasarani Area Apartments
  {
    id: "kasarani-estate",
    place_name: "Kasarani Estate, Kasarani, Nairobi",
    center: [36.9, -1.2167],
    text: "Kasarani Estate",
  },
  {
    id: "mwiki-estate",
    place_name: "Mwiki Estate, Kasarani, Nairobi",
    center: [36.91, -1.21],
    text: "Mwiki Estate",
  },
  {
    id: "clay-city",
    place_name: "Clay City Estate, Kasarani, Nairobi",
    center: [36.9, -1.2167],
    text: "Clay City",
  },
  {
    id: "roysambu-estate",
    place_name: "Roysambu Estate, Roysambu, Nairobi",
    center: [36.89, -1.22],
    text: "Roysambu Estate",
  },

  // Gigiri & UN Area Apartments
  {
    id: "gigiri-estate",
    place_name: "Gigiri Estate, Gigiri, Nairobi",
    center: [36.815, -1.243],
    text: "Gigiri Estate",
  },
  {
    id: "un-gigiri",
    place_name: "UN Gigiri Apartments, Gigiri, Nairobi",
    center: [36.815, -1.243],
    text: "UN Gigiri",
  },
  {
    id: "runda-estate",
    place_name: "Runda Estate, Runda, Nairobi",
    center: [36.82, -1.23],
    text: "Runda Estate",
  },

  // Thika Road Area Apartments
  {
    id: "thika-road-estates",
    place_name: "Thika Road Estates, Thika Road, Nairobi",
    center: [36.8833, -1.2167],
    text: "Thika Road Estates",
  },
  {
    id: "garden-estate",
    place_name: "Garden Estate, Thika Road, Nairobi",
    center: [36.89, -1.22],
    text: "Garden Estate",
  },
  {
    id: "pangani-estate",
    place_name: "Pangani Estate, Pangani, Nairobi",
    center: [36.84, -1.26],
    text: "Pangani Estate",
  },

  // Ngong Road Area Apartments
  {
    id: "adams-arcade",
    place_name: "Adams Arcade Apartments, Ngong Road, Nairobi",
    center: [36.77, -1.31],
    text: "Adams Arcade",
  },
  {
    id: "kilimani-drive",
    place_name: "Kilimani Drive Apartments, Ngong Road, Nairobi",
    center: [36.77, -1.3],
    text: "Kilimani Drive",
  },

  // Industrial Area Apartments
  {
    id: "industrial-area",
    place_name: "Industrial Area Apartments, Industrial Area, Nairobi",
    center: [36.84, -1.32],
    text: "Industrial Area",
  },
  {
    id: "enterprise-road",
    place_name: "Enterprise Road Apartments, Industrial Area, Nairobi",
    center: [36.84, -1.32],
    text: "Enterprise Road",
  },

  // Major Streets & Roads in Nairobi

  // Main CBD Streets
  {
    id: "kenyatta-avenue",
    place_name: "Kenyatta Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Kenyatta Avenue",
  },
  {
    id: "moi-avenue",
    place_name: "Moi Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Moi Avenue",
  },
  {
    id: "uhuru-highway",
    place_name: "Uhuru Highway, Nairobi",
    center: [36.8181, -1.289],
    text: "Uhuru Highway",
  },
  {
    id: "haile-selassie-avenue",
    place_name: "Haile Selassie Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Haile Selassie Avenue",
  },
  {
    id: "mama-ngina-street",
    place_name: "Mama Ngina Street, CBD, Nairobi",
    center: [36.8181, -1.2864],
    text: "Mama Ngina Street",
  },
  {
    id: "tom-mboya-street",
    place_name: "Tom Mboya Street, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Tom Mboya Street",
  },
  {
    id: "muindi-mbingu-street",
    place_name: "Muindi Mbingu Street, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Muindi Mbingu Street",
  },
  {
    id: "university-way",
    place_name: "University Way, CBD, Nairobi",
    center: [36.8181, -1.287],
    text: "University Way",
  },
  {
    id: "ronald-ngala-street",
    place_name: "Ronald Ngala Street, CBD, Nairobi",
    center: [36.8181, -1.289],
    text: "Ronald Ngala Street",
  },
  {
    id: "river-road",
    place_name: "River Road, CBD, Nairobi",
    center: [36.822, -1.289],
    text: "River Road",
  },

  // Major Highways & Roads
  {
    id: "thika-road",
    place_name: "Thika Road (A2), Nairobi",
    center: [36.8833, -1.2167],
    text: "Thika Road",
  },
  {
    id: "ngong-road",
    place_name: "Ngong Road, Nairobi",
    center: [36.77, -1.3],
    text: "Ngong Road",
  },
  {
    id: "mombasa-road",
    place_name: "Mombasa Road (A8), Nairobi",
    center: [36.84, -1.34],
    text: "Mombasa Road",
  },
  {
    id: "waiyaki-way",
    place_name: "Waiyaki Way, Nairobi",
    center: [36.8, -1.26],
    text: "Waiyaki Way",
  },
  {
    id: "kiambu-road",
    place_name: "Kiambu Road, Nairobi",
    center: [36.85, -1.23],
    text: "Kiambu Road",
  },
  {
    id: "jogoo-road",
    place_name: "Jogoo Road, Nairobi",
    center: [36.87, -1.29],
    text: "Jogoo Road",
  },
  {
    id: "outer-ring-road",
    place_name: "Outer Ring Road, Nairobi",
    center: [36.85, -1.3],
    text: "Outer Ring Road",
  },
  {
    id: "eastern-bypass",
    place_name: "Eastern Bypass, Nairobi",
    center: [36.95, -1.3],
    text: "Eastern Bypass",
  },
  {
    id: "southern-bypass",
    place_name: "Southern Bypass, Nairobi",
    center: [36.75, -1.38],
    text: "Southern Bypass",
  },
  {
    id: "northern-bypass",
    place_name: "Northern Bypass, Nairobi",
    center: [36.8, -1.18],
    text: "Northern Bypass",
  },

  // Westlands Area Roads
  {
    id: "westlands-road",
    place_name: "Westlands Road, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Westlands Road",
  },
  {
    id: "ralph-bunche-road",
    place_name: "Ralph Bunche Road, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Ralph Bunche Road",
  },
  {
    id: "chiromo-road",
    place_name: "Chiromo Road, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Chiromo Road",
  },
  {
    id: "ring-road-westlands",
    place_name: "Ring Road Westlands, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Ring Road Westlands",
  },

  // Upper Hill & Kilimani Roads
  {
    id: "argwings-kodhek-road",
    place_name: "Argwings Kodhek Road, Kilimani, Nairobi",
    center: [36.785, -1.295],
    text: "Argwings Kodhek Road",
  },
  {
    id: "wood-avenue-road",
    place_name: "Wood Avenue, Kilimani, Nairobi",
    center: [36.7833, -1.29],
    text: "Wood Avenue",
  },
  {
    id: "dennis-pritt-road",
    place_name: "Dennis Pritt Road, Kilimani, Nairobi",
    center: [36.785, -1.295],
    text: "Dennis Pritt Road",
  },
  {
    id: "ole-sangale-road",
    place_name: "Ole Sangale Road, Madaraka, Nairobi",
    center: [36.795, -1.305],
    text: "Ole Sangale Road",
  },

  // Karen & Langata Roads
  {
    id: "karen-road",
    place_name: "Karen Road, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen Road",
  },
  {
    id: "langata-road",
    place_name: "Langata Road, Nairobi",
    center: [36.75, -1.35],
    text: "Langata Road",
  },
  {
    id: "magadi-road",
    place_name: "Magadi Road, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Magadi Road",
  },

  // Eastlands Roads
  {
    id: "outering-road",
    place_name: "Outering Road, Eastlands, Nairobi",
    center: [36.87, -1.29],
    text: "Outering Road",
  },
  {
    id: "kangundo-road",
    place_name: "Kangundo Road, Eastlands, Nairobi",
    center: [36.92, -1.28],
    text: "Kangundo Road",
  },
  {
    id: "airport-north-road",
    place_name: "Airport North Road, Embakasi, Nairobi",
    center: [36.9, -1.31],
    text: "Airport North Road",
  },

  // Schools - Primary & Secondary

  // CBD & Central Nairobi Schools
  {
    id: "nairobi-school",
    place_name: "Nairobi School, Nairobi Hill, Nairobi",
    center: [36.81, -1.27],
    text: "Nairobi School",
  },
  {
    id: "hospital-hill-school",
    place_name: "Hospital Hill School, Hospital Hill, Nairobi",
    center: [36.805, -1.29],
    text: "Hospital Hill School",
  },
  {
    id: "eastleigh-high-school",
    place_name: "Eastleigh High School, Eastleigh, Nairobi",
    center: [36.85, -1.2833],
    text: "Eastleigh High School",
  },

  // Westlands Area Schools
  {
    id: "aga-khan-academy",
    place_name: "Aga Khan Academy, Nairobi",
    center: [36.82, -1.26],
    text: "Aga Khan Academy",
  },
  {
    id: "brookhouse-school",
    place_name: "Brookhouse School, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Brookhouse School",
  },
  {
    id: "international-school-kenya",
    place_name: "International School of Kenya, Nairobi",
    center: [36.815, -1.243],
    text: "International School of Kenya",
  },

  // Kilimani & Upper Hill Schools
  {
    id: "st-marys-school-nairobi",
    place_name: "St. Mary's School, Nairobi",
    center: [36.785, -1.295],
    text: "St. Mary's School",
  },
  {
    id: "braeside-school",
    place_name: "Braeside School, Nairobi",
    center: [36.785, -1.295],
    text: "Braeside School",
  },
  {
    id: "banda-school",
    place_name: "Banda School, Nairobi",
    center: [36.81, -1.28],
    text: "Banda School",
  },

  // Karen & Langata Schools
  {
    id: "karen-preparatory-school",
    place_name: "Karen Preparatory School, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen Preparatory School",
  },
  {
    id: "hillcrest-school",
    place_name: "Hillcrest School, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Hillcrest School",
  },
  {
    id: "peponi-school",
    place_name: "Peponi School, Ruiru, Kiambu",
    center: [36.95, -1.15],
    text: "Peponi School",
  },
  {
    id: "rosslyn-academy",
    place_name: "Rosslyn Academy, Nairobi",
    center: [36.815, -1.243],
    text: "Rosslyn Academy",
  },

  // Eastlands Schools
  {
    id: "ofafa-jericho-high",
    place_name: "Ofafa Jericho High School, Eastlands, Nairobi",
    center: [36.86, -1.28],
    text: "Ofafa Jericho High School",
  },
  {
    id: "makongeni-secondary",
    place_name: "Makongeni Secondary School, Makongeni, Nairobi",
    center: [36.87, -1.29],
    text: "Makongeni Secondary School",
  },
  {
    id: "starehe-boys-centre",
    place_name: "Starehe Boys' Centre, Nairobi",
    center: [36.84, -1.26],
    text: "Starehe Boys' Centre",
  },

  // National Schools
  {
    id: "alliance-high-school",
    place_name: "Alliance High School, Kikuyu, Kiambu",
    center: [36.65, -1.25],
    text: "Alliance High School",
  },
  {
    id: "alliance-girls-high",
    place_name: "Alliance Girls High School, Kikuyu, Kiambu",
    center: [36.65, -1.25],
    text: "Alliance Girls High School",
  },
  {
    id: "kenya-high-school",
    place_name: "Kenya High School, Nairobi",
    center: [36.805, -1.29],
    text: "Kenya High School",
  },

  // Kasarani & Thika Road Schools
  {
    id: "thika-road-primary",
    place_name: "Thika Road Primary Schools, Thika Road, Nairobi",
    center: [36.8833, -1.2167],
    text: "Thika Road Primary Schools",
  },
  {
    id: "kasarani-secondary",
    place_name: "Kasarani Secondary Schools, Kasarani, Nairobi",
    center: [36.9, -1.2167],
    text: "Kasarani Secondary Schools",
  },

  // Colleges & Tertiary Institutions
  {
    id: "kenyatta-university",
    place_name: "Kenyatta University, Kahawa, Kiambu",
    center: [36.93, -1.18],
    text: "Kenyatta University",
  },
  {
    id: "jkuat",
    place_name:
      "Jomo Kenyatta University of Agriculture and Technology (JKUAT), Juja, Kiambu",
    center: [37.01, -1.1],
    text: "JKUAT",
  },
  {
    id: "multimedia-university",
    place_name: "Multimedia University of Kenya, Nairobi",
    center: [36.89, -1.22],
    text: "Multimedia University",
  },
  {
    id: "technical-university",
    place_name: "Technical University of Kenya, Nairobi",
    center: [36.8181, -1.279],
    text: "Technical University of Kenya",
  },
  {
    id: "catholic-university",
    place_name: "Catholic University of Eastern Africa, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Catholic University",
  },
  {
    id: "kenya-institute-management",
    place_name: "Kenya Institute of Management (KIM), Nairobi",
    center: [36.8181, -1.2873],
    text: "Kenya Institute of Management",
  },
  {
    id: "kenya-polytechnic",
    place_name: "Kenya Polytechnic University College, Nairobi",
    center: [36.8181, -1.289],
    text: "Kenya Polytechnic",
  },
  {
    id: "kimc",
    place_name: "Kenya Institute of Mass Communication (KIMC), Nairobi",
    center: [36.805, -1.295],
    text: "KIMC",
  },

  // Professional Training Institutes
  {
    id: "kenya-school-law",
    place_name: "Kenya School of Law, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Kenya School of Law",
  },
  {
    id: "kenya-medical-training",
    place_name: "Kenya Medical Training College, Nairobi",
    center: [36.805, -1.3],
    text: "Kenya Medical Training College",
  },
  {
    id: "kenya-institute-highways",
    place_name: "Kenya Institute of Highways and Building Technology, Nairobi",
    center: [36.85, -1.25],
    text: "Kenya Institute of Highways",
  },

  // Additional Popular Locations & Drives (User Requested)

  // TRM Drive & Mirema Drive
  {
    id: "trm-drive",
    place_name: "TRM Drive, Thika Road, Nairobi",
    center: [36.8833, -1.2167],
    text: "TRM Drive",
  },
  {
    id: "mirema-drive",
    place_name: "Mirema Drive, Kasarani, Nairobi",
    center: [36.9, -1.2167],
    text: "Mirema Drive",
  },

  // More Shopping Centers
  {
    id: "two-rivers-mall",
    place_name: "Two Rivers Mall, Limuru Road, Nairobi",
    center: [36.81, -1.23],
    text: "Two Rivers Mall",
  },
  {
    id: "greenspan-mall",
    place_name: "Greenspan Mall, Donholm, Nairobi",
    center: [36.9, -1.27],
    text: "Greenspan Mall",
  },
  {
    id: "pine-creek-mall",
    place_name: "Pine Creek Mall, Kiambu Road, Nairobi",
    center: [36.85, -1.23],
    text: "Pine Creek Mall",
  },
  {
    id: "quickmart-mall",
    place_name: "Quickmart Mall, Ngong Road, Nairobi",
    center: [36.77, -1.32],
    text: "Quickmart Mall",
  },
  {
    id: "crystal-plaza",
    place_name: "Crystal Plaza, Mombasa Road, Nairobi",
    center: [36.84, -1.34],
    text: "Crystal Plaza",
  },

  // More Business Districts
  {
    id: "gigiri-business-center",
    place_name: "Gigiri Business Center, Gigiri, Nairobi",
    center: [36.815, -1.243],
    text: "Gigiri Business Center",
  },
  {
    id: "riverside-business-park",
    place_name: "Riverside Business Park, Riverside, Nairobi",
    center: [36.81, -1.27],
    text: "Riverside Business Park",
  },
  {
    id: "westgate-business-center",
    place_name: "Westgate Business Center, Westlands, Nairobi",
    center: [36.8065, -1.2676],
    text: "Westgate Business Center",
  },

  // More Hotels & Lodges
  {
    id: "safari-park-hotel",
    place_name: "Safari Park Hotel, Thika Road, Nairobi",
    center: [36.8833, -1.2167],
    text: "Safari Park Hotel",
  },
  {
    id: "ole-sereni-hotel",
    place_name: "Ole Sereni Hotel, Mombasa Road, Nairobi",
    center: [36.92, -1.33],
    text: "Ole Sereni Hotel",
  },
  {
    id: "crowne-plaza",
    place_name: "Crowne Plaza Nairobi, Upper Hill, Nairobi",
    center: [36.805, -1.295],
    text: "Crowne Plaza",
  },
  {
    id: "fairmont-norfolk",
    place_name: "Fairmont The Norfolk Hotel, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Fairmont Norfolk Hotel",
  },

  // More Medical Centers
  {
    id: "mp-shah-hospital",
    place_name: "MP Shah Hospital, Nairobi",
    center: [36.805, -1.29],
    text: "MP Shah Hospital",
  },
  {
    id: "gertrudes-hospital",
    place_name: "Gertrude's Children's Hospital, Muthaiga, Nairobi",
    center: [36.82, -1.26],
    text: "Gertrude's Hospital",
  },
  {
    id: "karen-hospital",
    place_name: "Karen Hospital, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen Hospital",
  },

  // More Entertainment Venues
  {
    id: "carnivore-restaurant",
    place_name: "Carnivore Restaurant, Langata, Nairobi",
    center: [36.75, -1.35],
    text: "Carnivore Restaurant",
  },
  {
    id: "giraffe-centre",
    place_name: "Giraffe Centre, Langata, Nairobi",
    center: [36.74, -1.34],
    text: "Giraffe Centre",
  },
  {
    id: "kazuri-beads",
    place_name: "Kazuri Beads Factory, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Kazuri Beads",
  },

  // More Transport Hubs
  {
    id: "green-park-terminus",
    place_name: "Green Park Terminus, Ngara, Nairobi",
    center: [36.83, -1.26],
    text: "Green Park Terminus",
  },
  {
    id: "machakos-bus-station",
    place_name: "Machakos Country Bus Station, CBD, Nairobi",
    center: [36.8181, -1.289],
    text: "Machakos Bus Station",
  },

  // KIAMBU COUNTY LOCATIONS

  // Major Towns in Kiambu County
  {
    id: "kiambu-town",
    place_name: "Kiambu Town, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu Town",
  },
  {
    id: "thika-town",
    place_name: "Thika Town, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Town",
  },
  {
    id: "limuru-town",
    place_name: "Limuru Town, Kiambu County",
    center: [36.6435, -1.1175],
    text: "Limuru Town",
  },
  {
    id: "kikuyu-town",
    place_name: "Kikuyu Town, Kiambu County",
    center: [36.6621, -1.2438],
    text: "Kikuyu Town",
  },
  {
    id: "ruiru-town",
    place_name: "Ruiru Town, Kiambu County",
    center: [36.9633, -1.1439],
    text: "Ruiru Town",
  },
  {
    id: "juja-town",
    place_name: "Juja Town, Kiambu County",
    center: [36.9936, -1.1055],
    text: "Juja Town",
  },
  {
    id: "gatundu-town",
    place_name: "Gatundu Town, Kiambu County",
    center: [36.9167, -0.9667],
    text: "Gatundu Town",
  },
  {
    id: "lari-town",
    place_name: "Lari Town, Kiambu County",
    center: [36.7, -1.05],
    text: "Lari Town",
  },

  // Major Estates & Residential Areas in Kiambu County
  {
    id: "kahawa-wendani",
    place_name: "Kahawa Wendani, Kiambu County",
    center: [36.92, -1.16],
    text: "Kahawa Wendani",
  },
  {
    id: "kahawa-west-kiambu",
    place_name: "Kahawa West, Kiambu County",
    center: [36.93, -1.18],
    text: "Kahawa West",
  },
  {
    id: "kahawa-sukari-kiambu",
    place_name: "Kahawa Sukari, Kiambu County",
    center: [36.94, -1.17],
    text: "Kahawa Sukari",
  },
  {
    id: "githurai-44",
    place_name: "Githurai 44, Kiambu County",
    center: [36.92, -1.15],
    text: "Githurai 44",
  },
  {
    id: "githurai-45",
    place_name: "Githurai 45, Kiambu County",
    center: [36.925, -1.145],
    text: "Githurai 45",
  },
  {
    id: "kihunguro",
    place_name: "Kihunguro, Ruiru, Kiambu County",
    center: [36.95, -1.13],
    text: "Kihunguro",
  },
  {
    id: "membley-estate",
    place_name: "Membley Estate, Ruiru, Kiambu County",
    center: [36.96, -1.14],
    text: "Membley Estate",
  },
  {
    id: "kamiti",
    place_name: "Kamiti, Kiambu County",
    center: [36.9, -1.12],
    text: "Kamiti",
  },
  {
    id: "banana-hill",
    place_name: "Banana Hill, Kiambu County",
    center: [36.85, -1.18],
    text: "Banana Hill",
  },
  {
    id: "wangige",
    place_name: "Wangige, Kiambu County",
    center: [36.72, -1.22],
    text: "Wangige",
  },

  // Shopping Centers in Kiambu County
  {
    id: "kiambu-mall",
    place_name: "Kiambu Mall, Kiambu Town, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu Mall",
  },
  {
    id: "blue-post-hotel-thika",
    place_name: "Blue Post Hotel, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Blue Post Hotel Thika",
  },
  {
    id: "thika-shopping-center",
    place_name: "Thika Shopping Center, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Shopping Center",
  },
  {
    id: "ruiru-shopping-center",
    place_name: "Ruiru Shopping Center, Ruiru, Kiambu County",
    center: [36.9633, -1.1439],
    text: "Ruiru Shopping Center",
  },
  {
    id: "githunguri-shopping-center",
    place_name: "Githunguri Shopping Center, Githunguri, Kiambu County",
    center: [36.75, -1.05],
    text: "Githunguri Shopping Center",
  },

  // Educational Institutions in Kiambu County
  {
    id: "kenyatta-university-kiambu",
    place_name: "Kenyatta University, Kahawa, Kiambu County",
    center: [36.93, -1.18],
    text: "Kenyatta University",
  },
  {
    id: "jkuat-juja",
    place_name: "JKUAT University, Juja, Kiambu County",
    center: [37.01, -1.1],
    text: "JKUAT University",
  },
  {
    id: "presbyterian-university",
    place_name: "Presbyterian University of East Africa, Kikuyu, Kiambu County",
    center: [36.6621, -1.2438],
    text: "Presbyterian University",
  },
  {
    id: "kiambu-institute-technology",
    place_name: "Kiambu Institute of Science and Technology, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu Institute of Technology",
  },
  {
    id: "thika-technical-college",
    place_name: "Thika Technical Training Institute, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Technical College",
  },

  // Health Facilities in Kiambu County
  {
    id: "kiambu-hospital",
    place_name: "Kiambu Level 5 Hospital, Kiambu Town, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu Hospital",
  },
  {
    id: "thika-level-5-hospital",
    place_name: "Thika Level 5 Hospital, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Level 5 Hospital",
  },
  {
    id: "ruiru-sub-county-hospital",
    place_name: "Ruiru Sub County Hospital, Ruiru, Kiambu County",
    center: [36.9633, -1.1439],
    text: "Ruiru Hospital",
  },
  {
    id: "limuru-health-center",
    place_name: "Limuru Health Center, Limuru, Kiambu County",
    center: [36.6435, -1.1175],
    text: "Limuru Health Center",
  },

  // Industrial Areas in Kiambu County
  {
    id: "thika-industrial-area",
    place_name: "Thika Industrial Area, Thika, Kiambu County",
    center: [37.08, -1.03],
    text: "Thika Industrial Area",
  },
  {
    id: "ruiru-industrial-area",
    place_name: "Ruiru Industrial Area, Ruiru, Kiambu County",
    center: [36.97, -1.14],
    text: "Ruiru Industrial Area",
  },

  // Transport Hubs in Kiambu County
  {
    id: "thika-bus-station",
    place_name: "Thika Bus Station, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Bus Station",
  },
  {
    id: "kiambu-bus-station",
    place_name: "Kiambu Bus Station, Kiambu Town, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu Bus Station",
  },
  {
    id: "ruiru-stage",
    place_name: "Ruiru Matatu Stage, Ruiru, Kiambu County",
    center: [36.9633, -1.1439],
    text: "Ruiru Stage",
  },

  // Government Offices in Kiambu County
  {
    id: "kiambu-county-headquarters",
    place_name:
      "Kiambu County Government Headquarters, Kiambu Town, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu County HQ",
  },
  {
    id: "thika-sub-county-offices",
    place_name: "Thika Sub County Offices, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Sub County Offices",
  },

  // Markets in Kiambu County
  {
    id: "kiambu-market",
    place_name: "Kiambu Municipal Market, Kiambu Town, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu Market",
  },
  {
    id: "thika-market",
    place_name: "Thika Municipal Market, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Market",
  },
  {
    id: "ruiru-market",
    place_name: "Ruiru Market, Ruiru, Kiambu County",
    center: [36.9633, -1.1439],
    text: "Ruiru Market",
  },

  // Religious Centers in Kiambu County
  {
    id: "kiambu-catholic-church",
    place_name: "Kiambu Catholic Church, Kiambu Town, Kiambu County",
    center: [36.834, -1.174],
    text: "Kiambu Catholic Church",
  },
  {
    id: "thika-cathedral",
    place_name: "Thika Cathedral, Thika, Kiambu County",
    center: [37.0691, -1.0332],
    text: "Thika Cathedral",
  },

  // Entertainment & Recreation in Kiambu County
  {
    id: "fourteen-falls",
    place_name: "Fourteen Falls, Thika, Kiambu County",
    center: [37.05, -1.05],
    text: "Fourteen Falls",
  },
  {
    id: "chania-falls",
    place_name: "Chania Falls, Thika, Kiambu County",
    center: [37.04, -1.04],
    text: "Chania Falls",
  },
  {
    id: "kiambu-golf-club",
    place_name: "Kiambu Golf Club, Kiambu County",
    center: [36.84, -1.17],
    text: "Kiambu Golf Club",
  },

  // Additional streets, gardens, estates, houses and local places requested
  {
    id: "mirema-drive",
    place_name: "Mirema Drive, Kiambu Road / Ruiru, Nairobi",
    center: [36.899, -1.226],
    text: "Mirema Drive",
  },
  {
    id: "trm-drive",
    place_name: "TRM Drive (Thika Road Mall area), Nairobi",
    center: [36.883, -1.216],
    text: "TRM Drive",
  },
  {
    id: "moi-avenue",
    place_name: "Moi Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Moi Avenue",
  },
  {
    id: "kenyatta-avenue",
    place_name: "Kenyatta Avenue, CBD, Nairobi",
    center: [36.8181, -1.2873],
    text: "Kenyatta Avenue",
  },
  {
    id: "haile-selassie-avenue",
    place_name: "Haile Selassie Avenue, Nairobi",
    center: [36.818, -1.2873],
    text: "Haile Selassie Avenue",
  },
  {
    id: "mama-ngina-street",
    place_name: "Mama Ngina Street, CBD, Nairobi",
    center: [36.818, -1.2864],
    text: "Mama Ngina Street",
  },
  {
    id: "langata-road",
    place_name: "Langata Road, Nairobi",
    center: [36.789, -1.318],
    text: "Langata Road",
  },
  {
    id: "ngong-road",
    place_name: "Ngong Road, Nairobi",
    center: [36.7819, -1.3019],
    text: "Ngong Road",
  },
  {
    id: "mombasa-road",
    place_name: "Mombasa Road, Nairobi",
    center: [36.845, -1.297],
    text: "Mombasa Road",
  },
  {
    id: "mile-2-road",
    place_name: "Mile 2 Road, Nairobi",
    center: [36.841, -1.296],
    text: "Mile 2 Road",
  },
  {
    id: "mwiki-road",
    place_name: "Mwiki Road, Kasarani, Nairobi",
    center: [36.91, -1.21],
    text: "Mwiki Road",
  },
  {
    id: "karen-estate",
    place_name: "Karen Estate, Karen, Nairobi",
    center: [36.7026, -1.3318],
    text: "Karen Estate",
  },
  {
    id: "lavington-gardens",
    place_name: "Lavington Gardens, Lavington, Nairobi",
    center: [36.765, -1.28],
    text: "Lavington Gardens",
  },
  {
    id: "muthaiga-gardens",
    place_name: "Muthaiga Gardens, Muthaiga, Nairobi",
    center: [36.79, -1.28],
    text: "Muthaiga Gardens",
  },
  {
    id: "woodvale-grove-gardens",
    place_name: "Woodvale Grove Gardens, Westlands, Nairobi",
    center: [36.815, -1.265],
    text: "Woodvale Grove Gardens",
  },
  {
    id: "brookside-drive",
    place_name: "Brookside Drive, Westlands, Nairobi",
    center: [36.8103, -1.2676],
    text: "Brookside Drive",
  },
  {
    id: "hillcrest-gardens",
    place_name: "Hillcrest Gardens, Parklands, Nairobi",
    center: [36.82, -1.26],
    text: "Hillcrest Gardens",
  },
  {
    id: "valley-arcade-gardens",
    place_name: "Valley Arcade Gardens, Lavington, Nairobi",
    center: [36.765, -1.285],
    text: "Valley Arcade Gardens",
  },
  {
    id: "royal-estate",
    place_name: "Royal Estate, Embakasi, Nairobi",
    center: [36.883, -1.316],
    text: "Royal Estate",
  },
  {
    id: "umpeo-estate",
    place_name: "Umoja Estate, Umoja, Nairobi",
    center: [36.89, -1.28],
    text: "Umoja Estate",
  },
  {
    id: "donholm-estate",
    place_name: "Donholm Estate, Donholm, Nairobi",
    center: [36.9, -1.27],
    text: "Donholm Estate",
  },
  {
    id: "south-b-estate",
    place_name: "South B Estate, South B, Nairobi",
    center: [36.83, -1.31],
    text: "South B Estate",
  },
  {
    id: "parkview-estate",
    place_name: "Parkview Estate, Parklands, Nairobi",
    center: [36.82, -1.26],
    text: "Parkview Estate",
  },
  {
    id: "royal-gardens",
    place_name: "Royal Gardens, Westlands, Nairobi",
    center: [36.81, -1.265],
    text: "Royal Gardens",
  },
  {
    id: "kilimani-close",
    place_name: "Kilimani Close, Kilimani, Nairobi",
    center: [36.7833, -1.287],
    text: "Kilimani Close",
  },
  {
    id: "rose-avenue-gardens",
    place_name: "Rose Avenue Gardens, Kilimani, Nairobi",
    center: [36.785, -1.295],
    text: "Rose Avenue Gardens",
  },
  {
    id: "parklands-crescent",
    place_name: "Parklands Crescent, Parklands, Nairobi",
    center: [36.82, -1.26],
    text: "Parklands Crescent",
  },
  {
    id: "north-lands-drive",
    place_name: "Northlands Drive, Westlands, Nairobi",
    center: [36.806, -1.267],
    text: "Northlands Drive",
  },
  {
    id: "riverside-drive",
    place_name: "Riverside Drive, Riverside, Nairobi",
    center: [36.81, -1.27],
    text: "Riverside Drive",
  },
  {
    id: "thika-road-estates",
    place_name: "Thika Road Estates, Thika Road, Nairobi",
    center: [36.8833, -1.2167],
    text: "Thika Road Estates",
  },
  {
    id: "mwiki-close",
    place_name: "Mwiki Close, Kasarani, Nairobi",
    center: [36.91, -1.21],
    text: "Mwiki Close",
  },
  {
    id: "kirawa-lane",
    place_name: "Kirawa Lane, Westlands, Nairobi",
    center: [36.81, -1.267],
    text: "Kirawa Lane",
  },
  {
    id: "ridgeways-gardens",
    place_name: "Ridgeways Gardens, Ridgeways, Nairobi",
    center: [36.8, -1.26],
    text: "Ridgeways Gardens",
  },
  {
    id: "oak-house",
    place_name: "Oak House, Residential Area, Nairobi",
    center: [36.81, -1.29],
    text: "Oak House",
  },
  {
    id: "elm-house",
    place_name: "Elm House, Residential Area, Nairobi",
    center: [36.812, -1.288],
    text: "Elm House",
  },
  {
    id: "maple-house",
    place_name: "Maple House, Residential Area, Nairobi",
    center: [36.813, -1.286],
    text: "Maple House",
  },
  {
    id: "garden-city-street",
    place_name: "Garden City Street, Thika Road, Nairobi",
    center: [36.895, -1.21],
    text: "Garden City Street",
  },
  {
    id: "ridgecrest-gardens",
    place_name: "Ridgecrest Gardens, Upper Hill, Nairobi",
    center: [36.805, -1.295],
    text: "Ridgecrest Gardens",
  },
  {
    id: "mount-kenya-gardens",
    place_name: "Mount Kenya Gardens, Nairobi (local name)",
    center: [36.82, -1.28],
    text: "Mount Kenya Gardens",
  },
  {
    id: "greenlane-gardens",
    place_name: "Greenlane Gardens, Nairobi",
    center: [36.82, -1.285],
    text: "Greenlane Gardens",
  },
  {
    id: "kiambu-street",
    place_name: "Main Street, Kiambu Town",
    center: [36.834, -1.174],
    text: "Kiambu Main Street",
  },
];

export default function SimpleMapboxLocationPicker({
  onLocationSelect,
  onDistanceCalculated,
}: LocationPickerProps) {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupResults, setPickupResults] = useState<SearchResult[]>([]);
  const [dropoffResults, setDropoffResults] = useState<SearchResult[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [showPickupResults, setShowPickupResults] = useState(false);
  const [showDropoffResults, setShowDropoffResults] = useState(false);

  const pickupTimeoutRef = useRef<NodeJS.Timeout>();
  const dropoffTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced search function with local landmarks database
  const searchLocation = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim() || query.length < 2) return [];

    const queryLower = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search local landmarks database first
    const localMatches = KENYAN_LANDMARKS.filter(
      (landmark) =>
        landmark.text.toLowerCase().includes(queryLower) ||
        landmark.place_name.toLowerCase().includes(queryLower) ||
        landmark.id.toLowerCase().includes(queryLower.replace(/\s+/g, "-")),
    );

    // Add local matches to results
    results.push(...localMatches);

    // If we have good local matches, prioritize them
    if (localMatches.length >= 3) {
      return results.slice(0, 8);
    }

    // Supplement with Mapbox API results if we need more
    if (MAPBOX_ACCESS_TOKEN && query.length >= 3) {
      try {
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${MAPBOX_ACCESS_TOKEN}&` +
          `country=KE&` +
          `proximity=36.8219,-1.2921&` + // Bias towards Nairobi
          `types=place,locality,neighborhood,address,poi&` +
          `limit=5`;

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();

          if (data.features && !data.message) {
            // Add Mapbox results that don't duplicate local results
            const mapboxResults = data.features.filter(
              (feature: any) =>
                !results.some(
                  (existing) =>
                    Math.abs(existing.center[0] - feature.center[0]) < 0.001 &&
                    Math.abs(existing.center[1] - feature.center[1]) < 0.001,
                ),
            );

            results.push(...mapboxResults);
          }
        }
      } catch (error) {
        console.error("Mapbox search supplementation failed:", error);
        // Continue with local results only
      }
    }

    // Return top 8 results
    return results.slice(0, 8);
  };

  // Debounced search for pickup location
  useEffect(() => {
    if (pickupTimeoutRef.current) {
      clearTimeout(pickupTimeoutRef.current);
    }

    if (pickupQuery.length >= 3) {
      setIsSearchingPickup(true);
      setShowPickupResults(true);

      pickupTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(pickupQuery);
        setPickupResults(results);
        setIsSearchingPickup(false);
      }, 300);
    } else {
      setPickupResults([]);
      setShowPickupResults(false);
      setIsSearchingPickup(false);
    }

    return () => {
      if (pickupTimeoutRef.current) {
        clearTimeout(pickupTimeoutRef.current);
      }
    };
  }, [pickupQuery]);

  // Debounced search for dropoff location
  useEffect(() => {
    if (dropoffTimeoutRef.current) {
      clearTimeout(dropoffTimeoutRef.current);
    }

    if (dropoffQuery.length >= 3) {
      setIsSearchingDropoff(true);
      setShowDropoffResults(true);

      dropoffTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(dropoffQuery);
        setDropoffResults(results);
        setIsSearchingDropoff(false);
      }, 300);
    } else {
      setDropoffResults([]);
      setShowDropoffResults(false);
      setIsSearchingDropoff(false);
    }

    return () => {
      if (dropoffTimeoutRef.current) {
        clearTimeout(dropoffTimeoutRef.current);
      }
    };
  }, [dropoffQuery]);

  // Calculate distance and duration using Mapbox Directions API
  const calculateRoute = useCallback(
    async (pickup: Location, dropoff: Location) => {
      if (!MAPBOX_ACCESS_TOKEN) {
        console.error(
          "Mapbox access token is not available for route calculation",
        );
        // Fallback to straight-line distance
        const straightLineDistance = calculateStraightLineDistance(
          pickup.lat,
          pickup.lng,
          dropoff.lat,
          dropoff.lng,
        );
        const estimatedDuration = (straightLineDistance / 25) * 60; // Assume 25 km/h average speed

        setDistance(straightLineDistance);
        setDuration(estimatedDuration);

        if (onDistanceCalculated) {
          onDistanceCalculated(straightLineDistance, estimatedDuration);
        }
        return;
      }

      try {
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?` +
          `access_token=${MAPBOX_ACCESS_TOKEN}&` +
          `geometries=geojson&` +
          `overview=simplified`;

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Directions request failed: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        const data = await response.json();

        if (data.message) {
          throw new Error(`Mapbox Directions API Error: ${data.message}`);
        }

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceInKm = route.distance / 1000; // Convert meters to kilometers
          const durationInMinutes = route.duration / 60; // Convert seconds to minutes

          setDistance(distanceInKm);
          setDuration(durationInMinutes);

          if (onDistanceCalculated) {
            onDistanceCalculated(distanceInKm, durationInMinutes);
          }
        } else {
          throw new Error("No routes found");
        }
      } catch (error) {
        console.error("Route calculation error:", error);
        // Fallback to straight-line distance
        const straightLineDistance = calculateStraightLineDistance(
          pickup.lat,
          pickup.lng,
          dropoff.lat,
          dropoff.lng,
        );
        const estimatedDuration = (straightLineDistance / 25) * 60; // Assume 25 km/h average speed

        setDistance(straightLineDistance);
        setDuration(estimatedDuration);

        if (onDistanceCalculated) {
          onDistanceCalculated(straightLineDistance, estimatedDuration);
        }
      }
    },
    [onDistanceCalculated],
  );

  // Fallback straight-line distance calculation
  const calculateStraightLineDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Handle location selection
  const selectPickupLocation = (result: SearchResult) => {
    const location: Location = {
      name: result.text,
      address: result.place_name,
      lat: result.center[1],
      lng: result.center[0],
    };

    setPickupLocation(location);
    setPickupQuery(result.place_name);
    setShowPickupResults(false);
  };

  const selectDropoffLocation = (result: SearchResult) => {
    const location: Location = {
      name: result.text,
      address: result.place_name,
      lat: result.center[1],
      lng: result.center[0],
    };

    setDropoffLocation(location);
    setDropoffQuery(result.place_name);
    setShowDropoffResults(false);
  };

  // Get user's current location
  const getCurrentLocation = (isPickup: boolean) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Reverse geocode to get address
          try {
            if (!MAPBOX_ACCESS_TOKEN) {
              throw new Error("Mapbox access token not available");
            }

            const url =
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
              `access_token=${MAPBOX_ACCESS_TOKEN}&` +
              `types=address,poi`;

            const response = await fetch(url);

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `Reverse geocoding failed: ${response.status} ${response.statusText} - ${errorText}`,
              );
            }

            const data = await response.json();

            if (data.message) {
              throw new Error(`Mapbox API Error: ${data.message}`);
            }

            const place = data.features?.[0];

            const location: Location = {
              name: place ? place.text : "Current Location",
              address: place
                ? place.place_name
                : `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              lat,
              lng,
            };

            if (isPickup) {
              setPickupLocation(location);
              setPickupQuery(location.address);
            } else {
              setDropoffLocation(location);
              setDropoffQuery(location.address);
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            const location: Location = {
              name: "Current Location",
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              lat,
              lng,
            };

            if (isPickup) {
              setPickupLocation(location);
              setPickupQuery(location.address);
            } else {
              setDropoffLocation(location);
              setDropoffQuery(location.address);
            }
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to get your current location. Please select manually.");
        },
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Clear location
  const clearPickupLocation = () => {
    setPickupLocation(null);
    setPickupQuery("");
    setShowPickupResults(false);
  };

  const clearDropoffLocation = () => {
    setDropoffLocation(null);
    setDropoffQuery("");
    setShowDropoffResults(false);
  };

  // Calculate route when both locations are selected
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateRoute(pickupLocation, dropoffLocation);
      onLocationSelect(pickupLocation, dropoffLocation);
    }
  }, [pickupLocation, dropoffLocation, calculateRoute, onLocationSelect]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-rocs-green" />
        Select Pickup & Drop-off Locations
      </h3>

      {/* Vertical Layout for Location Inputs */}
      <div className="space-y-6 mb-6">
        {/* Pickup Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location *
          </label>
          <div className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={pickupQuery}
                onChange={(e) => setPickupQuery(e.target.value)}
                onFocus={() =>
                  pickupQuery.length >= 3 && setShowPickupResults(true)
                }
                onBlur={() =>
                  setTimeout(() => setShowPickupResults(false), 200)
                }
                placeholder="Type pickup location..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-rocs-green focus:border-transparent text-sm"
              />
              {pickupQuery && (
                <button
                  onClick={clearPickupLocation}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => getCurrentLocation(true)}
              className="px-4 py-3 bg-rocs-yellow text-gray-800 rounded-r-lg hover:bg-rocs-yellow/90 transition-colors flex items-center text-sm"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Current
            </button>
          </div>

          {/* Pickup Search Results */}
          {showPickupResults &&
            (pickupResults.length > 0 || isSearchingPickup) && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearchingPickup ? (
                  <div className="p-3 text-center text-gray-500">
                    Searching...
                  </div>
                ) : (
                  pickupResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPickupLocation(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-800 text-sm">
                        {result.text}
                      </div>
                      <div className="text-xs text-gray-600">
                        {result.place_name}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-rocs-green/10 rounded-full flex items-center justify-center">
            <ArrowDown className="w-4 h-4 text-rocs-green" />
          </div>
        </div>

        {/* Dropoff Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drop-off Location *
          </label>
          <div className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={dropoffQuery}
                onChange={(e) => setDropoffQuery(e.target.value)}
                onFocus={() =>
                  dropoffQuery.length >= 3 && setShowDropoffResults(true)
                }
                onBlur={() =>
                  setTimeout(() => setShowDropoffResults(false), 200)
                }
                placeholder="Type drop-off location..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-rocs-green focus:border-transparent text-sm"
              />
              {dropoffQuery && (
                <button
                  onClick={clearDropoffLocation}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => getCurrentLocation(false)}
              className="px-4 py-3 bg-rocs-yellow text-gray-800 rounded-r-lg hover:bg-rocs-yellow/90 transition-colors flex items-center text-sm"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Current
            </button>
          </div>

          {/* Dropoff Search Results */}
          {showDropoffResults &&
            (dropoffResults.length > 0 || isSearchingDropoff) && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearchingDropoff ? (
                  <div className="p-3 text-center text-gray-500">
                    Searching...
                  </div>
                ) : (
                  dropoffResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectDropoffLocation(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-800 text-sm">
                        {result.text}
                      </div>
                      <div className="text-xs text-gray-600">
                        {result.place_name}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
        </div>
      </div>

      {/* Selected Locations Summary */}
      {(pickupLocation || dropoffLocation) && (
        <div className="space-y-3 mb-6">
          {pickupLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-800 text-sm">
                    Pickup: {pickupLocation.name}
                  </div>
                  <div className="text-xs text-green-600">
                    {pickupLocation.address}
                  </div>
                </div>
                <button
                  onClick={clearPickupLocation}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {dropoffLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-800 text-sm">
                    Drop-off: {dropoffLocation.name}
                  </div>
                  <div className="text-xs text-blue-600">
                    {dropoffLocation.address}
                  </div>
                </div>
                <button
                  onClick={clearDropoffLocation}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Distance and Time Display */}
      {distance && duration && (
        <div className="bg-rocs-green/10 border border-rocs-green/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-rocs-green">
                {distance.toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600">Distance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rocs-green">
                {Math.round(duration)} min
              </div>
              <div className="text-sm text-gray-600">Est. Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Mapbox Map */}
      <div className="relative">
        <MapboxMap
          pickup={pickupLocation}
          dropoff={dropoffLocation}
          height="400px"
          className="border border-gray-200 rounded-lg overflow-hidden"
        />

        {/* Map Status Overlay */}
        {!pickupLocation && !dropoffLocation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg pointer-events-none">
            <div className="text-center text-white bg-black bg-opacity-75 p-4 rounded-lg pointer-events-none">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <div className="font-medium">
                Select pickup and dropoff locations
              </div>
              <div className="text-sm opacity-90">
                to see them on the map with route
              </div>
            </div>
          </div>
        )}

        {pickupLocation && dropoffLocation && (
          <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
            <div className="font-medium text-rocs-green">
              Route: {pickupLocation.name} → {dropoffLocation.name}
            </div>
            {distance && (
              <div className="text-gray-600">
                Distance: {distance.toFixed(1)} km • Time: ~
                {Math.round(duration || 0)} min
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
