export const GENDERS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
] as const;

export const RELIGIONS = ["무교", "기독교", "천주교", "불교", "기타"] as const;

export const HEIGHT_MIN = 100;
export const HEIGHT_MAX = 230;
export const BIRTH_YEAR_MIN = 1950;

export const MAX_IMAGES = 3;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const IMAGE_BUCKET = "friend-images";

// 사진이 없는 친구에게 보여줄 기본 프로필 이미지 (public)
export const FALLBACK_AVATAR = "/fallback-avatar.png";

// 성인(만 19세) 기준. 출생연도만 저장하므로 연 나이(올해 - 출생연도)가 19 이상이면 허용한다.
export const ADULT_AGE = 19;

export function getBirthYearMax() {
  return new Date().getFullYear() - ADULT_AGE;
}

export function genderLabel(value: string) {
  return GENDERS.find((g) => g.value === value)?.label ?? value;
}
