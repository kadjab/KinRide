import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yoljlpsynxyqiszxyrei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbGpscHN5bnh5cWlzenhyZWkiLCJyb2xlIjoiYW9uIiwiaWF0IjoxNzA0MTEwNDAwLCJleHAiOjE4NjE4Nzg0MDB9.your_actual_key_here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  driver_rating?: number;
  passenger_rating?: number;
  phone?: string;
  bio?: string;
  push_token?: string;
  created_at: string;
};

export type Ride = {
  id: string;
  driver_id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  seats_available: number;
  description?: string;
  stops?: string[];
  created_at: string;
};

export type Booking = {
  id: string;
  ride_id: string;
  passenger_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
};

export type Rating = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};
