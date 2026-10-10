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
  // Storage 경로. 배열 순서가 표시 순서이고 첫 번째가 대표 이미지.
  image_paths: string[];
  created_at: string;
};

export type FriendWithImage = Friend & { imageUrls: string[] };

export type ExistingImage = { path: string; url: string };

export type FriendForEdit = FriendWithImage & { images: ExistingImage[] };
