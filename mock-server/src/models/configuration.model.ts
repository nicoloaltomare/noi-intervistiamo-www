export interface AccessArea {
  id: string;
  label: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface UserStatusConfig {
  value: string;
  label: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  isDefault: boolean;
  isActive: boolean;
}

export interface SystemConfiguration {
  accessAreas: AccessArea[];
  userStatuses: UserStatusConfig[];
  colorPalettes: ColorPalette[];
}
