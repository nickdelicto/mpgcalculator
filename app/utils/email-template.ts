import { FuelCosts, VehicleSelection } from '../components/FuelSavingsCalculator'
import { Vehicle } from '../types/vehicle'
import { ManualVehicleFuel, AVAILABLE_FUEL_TYPES, FuelTypeDefinition } from '../types/fuel'

// Helper function to get vehicle display name
function getVehicleDisplayName(selection: VehicleSelection): string {
  if (!selection) return 'Vehicle';
  
  // For vehicles from database
  if (!selection.isManualInput && selection.fromDb) {
    const vehicle = selection.fromDb;
    if (vehicle.year && vehicle.make && vehicle.model) {
      return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    }
  }
  
  // For manually entered vehicles
  if (selection.isManualInput && selection.manual) {
    if (selection.manual.name) return selection.manual.name;
  }
  
  return 'Vehicle';
}

interface EmailTemplateData {
  vehicle1: VehicleSelection
  vehicle2: VehicleSelection
  annualMileage: number
  cityHighwaySplit: number
  costs: {
    vehicle1: FuelCosts
    vehicle2: FuelCosts
  }
}

type PeriodKey = keyof FuelCosts

const periodLabels: Record<PeriodKey, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  annual: 'Annual',
  threeYear: '3 Years',
  fiveYear: '5 Years',
  tenYear: '10 Years'
}

function generateChartUrls(costs: { vehicle1: FuelCosts, vehicle2: FuelCosts }, vehicle1: VehicleSelection, vehicle2: VehicleSelection) {
  // Bar Chart URL
  const barLabels = ['Weekly', 'Monthly', 'Annual', '3 Years', '5 Years', '10 Years']
  const vehicle1Data = [
    costs.vehicle1.weekly,
    costs.vehicle1.monthly,
    costs.vehicle1.annual,
    costs.vehicle1.threeYear,
    costs.vehicle1.fiveYear,
    costs.vehicle1.tenYear
  ]
  const vehicle2Data = [
    costs.vehicle2.weekly,
    costs.vehicle2.monthly,
    costs.vehicle2.annual,
    costs.vehicle2.threeYear,
    costs.vehicle2.fiveYear,
    costs.vehicle2.tenYear
  ]

  const vehicle1Name = getVehicleDisplayName(vehicle1) || 'Vehicle 1'
  const vehicle2Name = getVehicleDisplayName(vehicle2) || 'Vehicle 2'

  const barChartUrl = `https://quickchart.io/chart?c={
    type:'bar',
    data:{
      labels:${JSON.stringify(barLabels)},
      datasets:[
        {
          label:${JSON.stringify(vehicle1Name)},
          data:${JSON.stringify(vehicle1Data)},
          backgroundColor:'rgba(30, 64, 175, 0.65)',
          borderColor:'rgb(30, 64, 175)',
          borderWidth:1
        },
        {
          label:${JSON.stringify(vehicle2Name)},
          data:${JSON.stringify(vehicle2Data)},
          backgroundColor:'rgba(5, 150, 105, 0.65)',
          borderColor:'rgb(5, 150, 105)',
          borderWidth:1
        }
      ]
    },
    options:{
      plugins:{
        title:{
          display:true,
          text:'Fuel Cost Comparison',
          color:'rgb(30, 64, 175)',
          font:{
            size:16,
            weight:'bold'
          }
        },
        legend:{
          position:'top',
          labels:{
            usePointStyle:true,
            padding:20,
            font:{
              size:12
            }
          }
        }
      },
      scales:{
        y:{
          grid:{
            color:'rgba(226, 232, 240, 0.5)'
          },
          beginAtZero:true,
          ticks:{
            callback:'function(value){return "$"+value.toLocaleString()}'
          }
        },
        x:{
          grid:{
            color:'rgba(226, 232, 240, 0.5)'
          }
        }
      }
    }
  }`

  // Line Chart URL
  const lineChartUrl = `https://quickchart.io/chart?c={
    type:'line',
    data:{
      labels:${JSON.stringify(barLabels)},
      datasets:[
        {
          label:${JSON.stringify(vehicle1Name)},
          data:${JSON.stringify(vehicle1Data)},
          borderColor:'rgb(30, 64, 175)',
          backgroundColor:'rgba(30, 64, 175, 0.1)',
          fill:true,
          tension:0.4
        },
        {
          label:${JSON.stringify(vehicle2Name)},
          data:${JSON.stringify(vehicle2Data)},
          borderColor:'rgb(5, 150, 105)',
          backgroundColor:'rgba(5, 150, 105, 0.1)',
          fill:true,
          tension:0.4
        }
      ]
    },
    options:{
      plugins:{
        title:{
          display:true,
          text:'Cumulative Fuel Costs Over Time',
          color:'rgb(30, 64, 175)',
          font:{
            size:16,
            weight:'bold'
          }
        },
        legend:{
          position:'top',
          labels:{
            usePointStyle:true,
            padding:20,
            font:{
              size:12
            }
          }
        }
      },
      scales:{
        y:{
          grid:{
            color:'rgba(226, 232, 240, 0.5)'
          },
          beginAtZero:true,
          ticks:{
            callback:'function(value){return "$"+value.toLocaleString()}'
          }
        },
        x:{
          grid:{
            color:'rgba(226, 232, 240, 0.5)'
          }
        }
      }
    }
  }`

  return {
    barChartUrl: encodeURI(barChartUrl),
    lineChartUrl: encodeURI(lineChartUrl)
  }
}

function getVehicleFuelType(selection: VehicleSelection): string {
  if (selection.isManualInput && selection.manual) {
    return selection.manual.primaryFuelType
  } else if (!selection.isManualInput && selection.fromDb) {
    return selection.fromDb.fuelType1
  }
  return 'Unknown Fuel Type'
}

function getVehicleEfficiency(selection: VehicleSelection): string {
  if (selection.isManualInput) {
    const manual = selection.manual;
    if (manual && manual.primaryFuelType && manual.primaryEfficiency) {
      const efficiency = manual.primaryEfficiency;
      const fuelDef = AVAILABLE_FUEL_TYPES.find(f => f.id === manual.primaryFuelType);
      const unit = fuelDef?.efficiencyUnit || 'MPG';
      // If city and highway are provided separately
      if (efficiency.city && efficiency.highway) {
        return `${efficiency.city} City / ${efficiency.highway} Highway ${unit}`;
      }
      // If only combined is provided
      return `${efficiency.combined} ${unit}`;
    }
  } else if (!selection.isManualInput && selection.fromDb) {
    const vehicle = selection.fromDb;
    const fuelDef = AVAILABLE_FUEL_TYPES.find(f => f.id === vehicle.fuelType1);
    const unit = fuelDef?.efficiencyUnit || 'MPG';
    // If city and highway are provided separately
    if (vehicle.city08 && vehicle.highway08) {
      return `${vehicle.city08} City / ${vehicle.highway08} Highway ${unit}`;
    }
    // If only combined is provided
    return `${vehicle.comb08} ${unit}`;
  }
  return 'Unknown Efficiency';
}

function getSecondaryFuelInfo(selection: VehicleSelection): { type: string; efficiency: string; cost: number | undefined } | null {
  if (selection.isManualInput) {
    const manual = selection.manual;
    if (manual && manual.secondaryFuelType && manual.secondaryEfficiency) {
      const efficiency = manual.secondaryEfficiency;
      const fuelDef = AVAILABLE_FUEL_TYPES.find(f => f.id === manual.secondaryFuelType);
      const unit = fuelDef?.efficiencyUnit || 'MPG';
      let efficiencyStr = '';
      if (efficiency.city && efficiency.highway) {
        efficiencyStr = `${efficiency.city} City / ${efficiency.highway} Highway ${unit}`;
      } else {
        efficiencyStr = `${efficiency.combined} ${unit}`;
      }
      return {
        type: manual.secondaryFuelType || 'Unknown',
        efficiency: efficiencyStr,
        cost: selection.fuelCost2
      };
    }
  } else if (!selection.isManualInput && selection.fromDb && selection.fromDb.fuelType2) {
    const vehicle = selection.fromDb;
    const fuelDef = AVAILABLE_FUEL_TYPES.find(f => f.id === vehicle.fuelType2);
    const unit = fuelDef?.efficiencyUnit || 'MPG';
    let efficiencyStr = '';
    if (vehicle.cityA08 && vehicle.highwayA08) {
      efficiencyStr = `${vehicle.cityA08} City / ${vehicle.highwayA08} Highway ${unit}`;
    } else {
      efficiencyStr = `${vehicle.combA08 || 0} ${unit}`;
    }
    return {
      type: vehicle.fuelType2 || 'Unknown',
      efficiency: efficiencyStr,
      cost: selection.fuelCost2
    };
  }
  return null;
}

// Helper function to get fuel type definition
function getFuelTypeDefinition(fuelType: string): FuelTypeDefinition | undefined {
  return AVAILABLE_FUEL_TYPES.find(f => 
    f.id === fuelType || f.label === fuelType
  )
}

// Helper function to get efficiency unit based on fuel type
function getEfficiencyUnit(fuelType: string): string {
  const fuelDef = getFuelTypeDefinition(fuelType)
  return fuelDef?.efficiencyUnit || 'MPG'
}

// Helper function to get cost unit based on fuel type
function getFuelCostUnit(fuelType: string): string {
  const fuelDef = getFuelTypeDefinition(fuelType)
  return fuelDef?.costUnit || '$/gallon'
}

// Helper function to format fuel cost with appropriate unit
function formatFuelCost(cost: number, fuelType: string): string {
  const costUnit = getFuelCostUnit(fuelType).replace('$/', '')
  return `$${cost.toFixed(2)}/${costUnit}`
}

// Helper function to format efficiency with appropriate unit
function formatEfficiency(efficiency: number, fuelType: string): string {
  const unit = getEfficiencyUnit(fuelType)
  return `${efficiency} ${unit}`
}

// Helper function to safely parse efficiency value
function parseEfficiencyValue(efficiency: string | number): number {
  if (typeof efficiency === 'number') return efficiency
  const parsed = parseFloat(efficiency)
  return isNaN(parsed) ? 0 : parsed
}

export function generateEmailTemplate(data: EmailTemplateData): string {
  const { barChartUrl, lineChartUrl } = generateChartUrls(data.costs, data.vehicle1, data.vehicle2)
  
  // Get secondary fuel info for both vehicles
  const vehicle1Secondary = getSecondaryFuelInfo(data.vehicle1)
  const vehicle2Secondary = getSecondaryFuelInfo(data.vehicle2)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your Fuel Savings Comparison</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(to right, #1e40af, #1e3a8a); padding: 40px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Your Fuel Savings Results</h1>
            <p style="color: #e2e8f0; margin: 12px 0 0 0; font-size: 16px;">Generated on ${new Date().toLocaleDateString()} from MPGCalculator.net</p>
          </td>
        </tr>

        <!-- Vehicle Comparison Section -->
        <tr>
          <td style="padding: 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 32px;">
                  <h2 style="color: #1e40af; margin: 0 0 24px 0; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Vehicle Comparison</h2>
                  
                  <!-- Vehicle 1 -->
                  <div style="background: linear-gradient(to right, rgba(30, 64, 175, 0.05), rgba(30, 64, 175, 0.02)); border: 1px solid rgba(30, 64, 175, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                    <h3 style="color: #1e40af; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center;">
                      <span style="display: inline-block; margin-right: 12px;">🚗</span>
                      ${getVehicleDisplayName(data.vehicle1)}
                    </h3>
                    <!-- Primary Fuel -->
                    <div style="margin-bottom: ${vehicle1Secondary ? '16px' : '0'};">
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #1e40af;">Primary Fuel:</strong> ${getVehicleFuelType(data.vehicle1)}
                        (${formatEfficiency(parseEfficiencyValue(getVehicleEfficiency(data.vehicle1)), getVehicleFuelType(data.vehicle1))})
                      </p>
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #1e40af;">Fuel Cost:</strong> ${formatFuelCost(data.vehicle1.fuelCost, getVehicleFuelType(data.vehicle1))}
                      </p>
                    </div>
                    <!-- Secondary Fuel if available -->
                    ${vehicle1Secondary ? `
                    <div style="background: rgba(30, 64, 175, 0.03); border-radius: 8px; padding: 12px; margin-top: 12px;">
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #1e40af;">Secondary Fuel:</strong> ${vehicle1Secondary.type}
                        (${formatEfficiency(parseEfficiencyValue(vehicle1Secondary.efficiency), vehicle1Secondary.type)})
                      </p>
                      ${vehicle1Secondary.cost ? `
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #1e40af;">Secondary Fuel Cost:</strong> ${formatFuelCost(vehicle1Secondary.cost, vehicle1Secondary.type)}
                      </p>
                      ` : ''}
                    </div>
                    ` : ''}
                  </div>

                  <!-- Vehicle 2 -->
                  <div style="background: linear-gradient(to right, rgba(5, 150, 105, 0.05), rgba(5, 150, 105, 0.02)); border: 1px solid rgba(5, 150, 105, 0.1); border-radius: 12px; padding: 20px;">
                    <h3 style="color: #059669; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center;">
                      <span style="display: inline-block; margin-right: 12px;">🚗</span>
                      ${getVehicleDisplayName(data.vehicle2)}
                    </h3>
                    <!-- Primary Fuel -->
                    <div style="margin-bottom: ${vehicle2Secondary ? '16px' : '0'};">
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #059669;">Primary Fuel:</strong> ${getVehicleFuelType(data.vehicle2)}
                        (${formatEfficiency(parseEfficiencyValue(getVehicleEfficiency(data.vehicle2)), getVehicleFuelType(data.vehicle2))})
                      </p>
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #059669;">Fuel Cost:</strong> ${formatFuelCost(data.vehicle2.fuelCost, getVehicleFuelType(data.vehicle2))}
                      </p>
                    </div>
                    <!-- Secondary Fuel if available -->
                    ${vehicle2Secondary ? `
                    <div style="background: rgba(5, 150, 105, 0.03); border-radius: 8px; padding: 12px; margin-top: 12px;">
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #059669;">Secondary Fuel:</strong> ${vehicle2Secondary.type}
                        (${formatEfficiency(parseEfficiencyValue(vehicle2Secondary.efficiency), vehicle2Secondary.type)})
                      </p>
                      ${vehicle2Secondary.cost ? `
                      <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                        <strong style="color: #059669;">Secondary Fuel Cost:</strong> ${formatFuelCost(vehicle2Secondary.cost, vehicle2Secondary.type)}
                      </p>
                      ` : ''}
                    </div>
                    ` : ''}
                  </div>
                </td>
              </tr>

              <!-- Driving Profile -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <h2 style="color: #1e40af; margin: 0 0 24px 0; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Your Driving Profile</h2>
                  <div style="background: linear-gradient(to right, rgba(30, 64, 175, 0.05), rgba(30, 64, 175, 0.02)); border: 1px solid rgba(30, 64, 175, 0.1); border-radius: 12px; padding: 20px;">
                    <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                      <strong style="color: #1e40af;">Annual Mileage:</strong> ${data.annualMileage.toLocaleString()} miles
                    </p>
                    <p style="margin: 8px 0; font-size: 15px; color: #475569;">
                      <strong style="color: #1e40af;">Highway/City Split:</strong> ${data.cityHighwaySplit}% Highway / ${100 - data.cityHighwaySplit}% City
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Cost Comparison Table -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <h2 style="color: #1e40af; margin: 0 0 24px 0; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Projected Fuel Costs & Savings Over Time</h2>
                  <div style="overflow-x: auto;">
                    <table width="100%" style="border-collapse: collapse; min-width: 100%; background: linear-gradient(to right, rgba(30, 64, 175, 0.05), rgba(30, 64, 175, 0.02)); border: 1px solid rgba(30, 64, 175, 0.1); border-radius: 12px;">
                      <thead>
                        <tr style="background: linear-gradient(to right, #1e40af, #1e3a8a);">
                          <th style="padding: 16px; text-align: left; font-size: 15px; color: white; font-weight: 500;">Time Period</th>
                          <th style="padding: 16px; text-align: right; font-size: 15px; color: white; font-weight: 500;">${getVehicleDisplayName(data.vehicle1) || 'Vehicle 1'}</th>
                          <th style="padding: 16px; text-align: right; font-size: 15px; color: white; font-weight: 500;">${getVehicleDisplayName(data.vehicle2) || 'Vehicle 2'}</th>
                          <th style="padding: 16px; text-align: right; font-size: 15px; color: white; font-weight: 500;">
                            ${(() => {
                              // Compare annual costs to determine which vehicle is cheaper
                              const vehicle1Annual = data.costs.vehicle1.annual;
                              const vehicle2Annual = data.costs.vehicle2.annual;
                              const cheaperVehicle = vehicle1Annual < vehicle2Annual ? data.vehicle1 : data.vehicle2;
                              const vehicleName = getVehicleDisplayName(cheaperVehicle) || (vehicle1Annual < vehicle2Annual ? 'Vehicle 1' : 'Vehicle 2');
                              return `${vehicleName} Savings`;
                            })()}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${Object.keys(periodLabels).map((period, index) => {
                          const periodKey = period as PeriodKey
                          const vehicle1Cost = data.costs.vehicle1[periodKey]
                          const vehicle2Cost = data.costs.vehicle2[periodKey]
                          const savings = Math.abs(vehicle1Cost - vehicle2Cost)
                          const cheaperVehicle = vehicle1Cost < vehicle2Cost ? data.vehicle1 : data.vehicle2
                          const vehicleName = getVehicleDisplayName(cheaperVehicle) || (vehicle1Cost < vehicle2Cost ? 'Vehicle 1' : 'Vehicle 2')
                          const isLast = index === Object.keys(periodLabels).length - 1
                          return `
                            <tr>
                              <td style="padding: 16px; border-bottom: ${isLast ? '0' : '1px'} solid rgba(30, 64, 175, 0.1); font-size: 15px; color: #475569;">${periodLabels[periodKey]}</td>
                              <td style="padding: 16px; border-bottom: ${isLast ? '0' : '1px'} solid rgba(30, 64, 175, 0.1); text-align: right; font-size: 15px; color: #1e40af;">$${vehicle1Cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td style="padding: 16px; border-bottom: ${isLast ? '0' : '1px'} solid rgba(30, 64, 175, 0.1); text-align: right; font-size: 15px; color: #6d28d9;">$${vehicle2Cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td style="padding: 16px; border-bottom: ${isLast ? '0' : '1px'} solid rgba(30, 64, 175, 0.1); text-align: right; font-size: 15px; font-weight: bold; color: #059669;">
                                $${savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </td>
                            </tr>
                          `
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Charts Section -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <h2 style="color: #1e40af; margin: 0 0 24px 0; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Cost Visualizations</h2>
                  
                  <!-- Bar Chart -->
                  <div style="margin-bottom: 32px; background: linear-gradient(to right, rgba(30, 64, 175, 0.05), rgba(30, 64, 175, 0.02)); border: 1px solid rgba(30, 64, 175, 0.1); border-radius: 12px; padding: 20px;">
                    <img src="${barChartUrl}" alt="Fuel Cost Comparison Chart" style="max-width: 100%; height: auto; border-radius: 8px;" />
                  </div>

                  <!-- Line Chart -->
                  <div style="background: linear-gradient(to right, rgba(30, 64, 175, 0.05), rgba(30, 64, 175, 0.02)); border: 1px solid rgba(30, 64, 175, 0.1); border-radius: 12px; padding: 20px;">
                    <img src="${lineChartUrl}" alt="Cumulative Fuel Costs Over Time" style="max-width: 100%; height: auto; border-radius: 8px;" />
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background: linear-gradient(to right, #1e40af, #1e3a8a); color: #ffffff; padding: 32px 24px; text-align: center;">
            <p style="margin: 0; font-size: 15px;">Calculate more savings at <a href="https://mpgcalculator.net/fuel-savings-calculator" style="color: #ffffff; text-decoration: underline; font-weight: 500;">MPGCalculator.net</a></p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
} 