export interface Vehicle {
  year: number
  make: string
  model: string
  VClass: string
  trany: string
  drive: string
  displ: number
  cylinders: number
  fuelType1: string
  fuelType2: string | null
  city08: number
  highway08: number
  comb08: number
  cityA08: number | null
  highwayA08: number | null
  combA08: number | null
  startStop: string
  sCharger: string
  tCharger: string
  phevBlended: boolean
  phevCity: number | null
  phevHwy: number | null
  phevComb: number | null
  co2: number | null
  co2A: number | null
  ghgScore: number | null
  ghgScoreA: number | null
} 