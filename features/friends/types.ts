export type Friend = {
  id: string;
  name: string;
  gender: "male" | "female";
  height_cm: number;
  birth_year: number;
  religion: string | null;
  personality: string | null;
  job: string;
  residence: string | null;
  ideal_type: string | null;
  image_path: string | null;
  created_at: string;
};

export type FriendWithImage = Friend & { imageUrl: string | null };
