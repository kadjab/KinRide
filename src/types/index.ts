export type RootStackParamList = {
  index: undefined;
  'auth/login': undefined;
  'auth/signup': undefined;
  'setup-profile': undefined;
  onboarding: undefined;
  '(tabs)': undefined;
  'ride-detail': { rideId: string };
  'driver-profile': { driverId: string };
  'chat': { chatId: string };
};

export type TabsParamList = {
  home: undefined;
  search: undefined;
  'my-trips': undefined;
  messages: undefined;
  profile: undefined;
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  driver_rating?: number;
  passenger_rating?: number;
  phone?: string;
  bio?: string;
}

export interface RidePost {
  id: string;
  driver_id: string;
  driver?: User;
  from_city: string;
  to_city: string;
  departure_date: string;
  seats_available: number;
  description?: string;
  stops?: string[];
  created_at: string;
}

export interface BookingRequest {
  id: string;
  ride_id: string;
  passenger_id: string;
  passenger?: User;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}

export interface Chat {
  id: string;
  ride_id: string;
  driver_id: string;
  passenger_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface UserRating {
  id: string;
  from_user_id: string;
  to_user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
