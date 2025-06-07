import dynamic from 'next/dynamic'
import { Coordinates } from '../utils/routingService'
import { POI } from '../utils/overpassService'

// Define prop types for the map component
interface MapProps {
  startCoords?: Coordinates;
  endCoords?: Coordinates;
  routeGeometry?: any;
  isFallbackRoute?: boolean;
  startLocation?: string;
  endLocation?: string;
  activePOILayers?: string[];
  onLayerChange?: (layers: string[]) => void;
  onSelectPOI?: (poi: POI) => void;
}

// Use dynamic import with ssr: false to prevent server-side rendering of the map component
const DynamicRoadTripMap = dynamic(
  () => import('./RoadTripMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-gray-800 border border-gray-700 rounded-lg">
        <div className="text-white text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }
) as React.ComponentType<MapProps>

export default DynamicRoadTripMap 