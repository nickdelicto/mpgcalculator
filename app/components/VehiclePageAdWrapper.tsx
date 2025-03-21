'use client'

import AdUnit from './AdUnit'
import { ADS_ENABLED, PAGE_AD_CONFIG } from '../config/ads'

type AdFormat = 'horizontal' | 'vertical' | 'rectangle' | 'auto';

export function VehiclePageAdWrapper({ 
  position, 
  children,
  showCondition = true 
}: { 
  position: keyof typeof PAGE_AD_CONFIG.vehicleDetail.adUnits,
  children: React.ReactNode,
  showCondition?: boolean
}) {
  const adsEnabled = ADS_ENABLED && PAGE_AD_CONFIG.vehicleDetail.enabled;
  const adConfig = PAGE_AD_CONFIG.vehicleDetail.adUnits;

  return (
    <>
      {children}
      {adsEnabled && showCondition && (
        <div className="my-8">
          <AdUnit 
            id={adConfig[position].id}
            format={adConfig[position].format as AdFormat}
            className="w-full"
          />
        </div>
      )}
    </>
  );
} 