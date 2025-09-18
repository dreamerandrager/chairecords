export type Profile = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    admin: boolean | null;
    created_at: string | null;
} | null;

export type ProfileDetails = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  admin: boolean | null;
  created_at: string | null;
};