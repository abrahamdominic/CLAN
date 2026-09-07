export type Role = "super_admin" | "admin" | "editor";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  avatar_url: string | null;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: "sermon" | "blog" | "event" | "resource";
  created_at?: string;
}

export interface Speaker {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  created_at?: string;
}

export interface Sermon {
  id: string;
  title: string;
  slug: string;
  speaker_id: string | null;
  speaker?: Speaker | null;
  date: string | null;
  category: string | null;
  scripture: string | null;
  description: string | null;
  thumbnail_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  notes_url: string | null;
  tags: string[] | null;
  featured: boolean;
  published: boolean;
  created_at?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  is_online: boolean;
  online_link: string | null;
  speaker: string | null;
  image_url: string | null;
  registration_link: string | null;
  category: string | null;
  published: boolean;
  created_at?: string;
}

export interface DiscipleshipProgram {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: string | null;
  schedule: string | null;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  created_at?: string;
}

export interface OutreachProject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  date: string | null;
  image_url: string | null;
  status: "upcoming" | "current" | "past";
  published: boolean;
  created_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  featured_image: string | null;
  content: string;
  category: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  published_date: string | null;
  published: boolean;
  featured: boolean;
  created_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  email: string | null;
  testimony: string;
  photo_url: string | null;
  approved: boolean;
  created_at?: string;
}

export type PrayerVisibility = "private" | "anonymous" | "public";

export interface PrayerRequest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  request: string;
  category: string | null;
  visibility: PrayerVisibility;
  prayed_for: boolean;
  created_at?: string;
}

export interface MembershipApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  church: string | null;
  areas_of_interest: string[] | null;
  discovered_via: string | null;
  message: string | null;
  status: "new" | "contacted" | "joined" | "archived";
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  created_at?: string;
}

export interface Donation {
  id: string;
  amount: number;
  currency?: string;
  category: string | null;
  donor_name: string | null;
  donor_email: string | null;
  status: string | null;
  reference: string | null;
  created_at?: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  type: string | null;
  size: number | null;
  alt: string | null;
  created_at?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  published: boolean;
  created_at?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  phone_number: string | null;
  active: boolean;
  confirmation_token: string | null;
  confirmation_token_expires_at: string | null;
  confirmed_at: string | null;
  created_at?: string;
  updated_at?: string;
}
