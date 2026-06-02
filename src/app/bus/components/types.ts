import { BusSeat } from '@/lib/data'

export type BookedSeatData = {
  gender: 'male' | 'female';
}

export type SelectedSeatWithGender = {
  seat: BusSeat;
  gender: 'male' | 'female';
}
