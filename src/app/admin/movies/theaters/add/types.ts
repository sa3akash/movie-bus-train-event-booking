export interface CineplexChain {
  id: string;
  name: string;
}

export interface TheaterFormInput {
  cineplexChainId: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  contactNumber: string;
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  foodAllowed: boolean;
  facilities: string[];
}
