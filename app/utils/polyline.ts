/**
 * Decodes an encoded polyline string into an array of coordinates
 * @param encoded Encoded polyline string
 * @returns Array of [longitude, latitude] coordinates
 */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  
  try {
    while (index < len) {
      let b;
    let shift = 0;
      let result = 0;
    do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
      shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

    shift = 0;
      result = 0;
    do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      const latF = lat * 1e-5;
      const lngF = lng * 1e-5;
      
      // Basic validation: ensure coordinates are within a valid range
      // Valid latitude range is -90 to 90, longitude is -180 to 180
      if (latF >= -90 && latF <= 90 && lngF >= -180 && lngF <= 180) {
        points.push([lngF, latF]);
      } else {
        console.warn(`Discarded invalid coordinate: [${lngF}, ${latF}]`);
      }
    }
  } catch (error) {
    console.error('Error decoding polyline:', error);
  }

  // Filter out any extreme jumps between consecutive points
  const filteredPoints: [number, number][] = [];
  const MAX_REASONABLE_JUMP = 5; // Maximum reasonable jump in degrees
  
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      // Always include the first point
      filteredPoints.push(points[i]);
    } else {
      const [prevLng, prevLat] = filteredPoints[filteredPoints.length - 1];
      const [currLng, currLat] = points[i];
      
      // Calculate distance in degrees (approximate)
      const lngDiff = Math.abs(currLng - prevLng);
      const latDiff = Math.abs(currLat - prevLat);
      
      // Check if the jump is unreasonably large
      if (lngDiff <= MAX_REASONABLE_JUMP && latDiff <= MAX_REASONABLE_JUMP) {
        filteredPoints.push(points[i]);
      } else {
        console.warn(`Discarded point with extreme jump: from [${prevLng}, ${prevLat}] to [${currLng}, ${currLat}]`);
      }
    }
  }
  
  // Ensure we have at least the start and end points
  if (filteredPoints.length === 0 && points.length > 0) {
    console.warn('All points were filtered out, using only the first point');
    filteredPoints.push(points[0]);
  }
  
  if (filteredPoints.length === 1 && points.length > 1) {
    console.warn('Adding end point to ensure at least two points');
    filteredPoints.push(points[points.length - 1]);
  }
  
  if (filteredPoints.length < points.length) {
    console.log(`Filtered ${points.length} points to ${filteredPoints.length} points due to extreme jumps`);
  }

  return filteredPoints;
} 