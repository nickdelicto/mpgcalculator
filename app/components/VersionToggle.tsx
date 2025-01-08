import React from 'react'
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"

interface VersionToggleProps {
  isAdvanced: boolean;
  onToggle: (checked: boolean) => void;
}

export function VersionToggle({ isAdvanced, onToggle }: VersionToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="version-toggle"
        checked={isAdvanced}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="version-toggle" className="text-sm font-medium text-gray-300">
        {isAdvanced ? 'Advanced Mode' : 'Simple Mode'}
      </Label>
    </div>
  )
}

