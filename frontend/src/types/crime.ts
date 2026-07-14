export type CrimeHead =
  | 'Theft'
  | 'Robbery'
  | 'Assault'
  | 'Burglary'
  | 'Murder'
  | 'Kidnapping'
  | 'Fraud'
  | 'Cybercrime'
  | 'Drug Offense'
  | 'Vandalism'
  | 'Domestic Violence'
  | 'Vehicle Theft'
  | 'Chain Snatching'
  | 'Eve Teasing'

export type CrimeGroup = 'Critical' | 'High' | 'Medium' | 'Low'

export type CrimeStatus = 'Open' | 'Under Investigation' | 'Closed' | 'Pending'

export interface FIR {
  id: string
  firNumber: string
  crimeHead: CrimeHead
  description: string
  crimeGroup: CrimeGroup
  status: CrimeStatus
  reportedAt: string
  location: Location
  district: string
  suspects: Suspect[]
  vehicles: Vehicle[]
  weapons: Weapon[]
  investigatingOfficer: string
}

export interface Case {
  id: string
  firId: string
  type: string
  details: string
  timestamp: string
  respondingOfficer: string
  location: Location
}

export interface Location {
  id: string
  address: string
  district: string
  policeUnit: string
  state: string
  latitude: number
  longitude: number
}

export interface Suspect {
  id: string
  name: string
  age: number
  gender: string
  description: string
  status: 'At Large' | 'Arrested' | 'Released' | 'Wanted'
}

export interface Vehicle {
  id: string
  make: string
  model: string
  color: string
  plateNumber: string
  description: string
}

export interface Weapon {
  id: string
  weaponType: string
  description: string
}

export interface Evidence {
  id: string
  firId: string
  evidenceType: string
  description: string
  collectedAt: string
  status: 'Collected' | 'Processing' | 'Analyzed' | 'Archived'
}

export interface Officer {
  id: string
  name: string
  badgeNumber: string
  rank: string
  department: string
  policeStation: string
}
