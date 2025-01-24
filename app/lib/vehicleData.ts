import { Vehicle } from '../types/vehicle'

export async function getVehicleDetails(id: string): Promise<Vehicle | null> {
  try {
    // Split on double underscore to avoid conflicts with model names containing single underscore
    const [make, model, year] = id.split('__').map(decodeURIComponent)
    
    if (!make || !model || !year) {
      console.error('Invalid vehicle ID format:', id)
      return null
    }

    // Create URL object to handle special characters properly
    const url = new URL('/api/vehicles/details', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
    url.searchParams.append('make', make)
    url.searchParams.append('model', model)
    url.searchParams.append('year', year.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data[0] || null
  } catch (error) {
    console.error('Error fetching vehicle details:', error)
    return null
  }
}