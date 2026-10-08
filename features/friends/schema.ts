import { z } from "zod";
import {
  BIRTH_YEAR_MIN,
  GENDERS,
  getBirthYearMax,
  HEIGHT_MAX,
  HEIGHT_MIN,
  RELIGIONS,
} from "./fields";

// 폼에서 빈 문자열로 넘어오는 선택 항목을 undefined로 바꾼다.
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export function createFriendSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, "이름을 입력해 주세요.")
      .max(30, "이름은 30자 이하로 입력해 주세요."),
    gender: z.enum(
      GENDERS.map((g) => g.value) as [string, ...string[]],
      { error: "성별을 선택해 주세요." },
    ),
    heightCm: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ error: "키를 입력해 주세요." })
        .int("키는 정수로 입력해 주세요.")
        .min(HEIGHT_MIN, `키는 ${HEIGHT_MIN}~${HEIGHT_MAX}cm 사이로 입력해 주세요.`)
        .max(HEIGHT_MAX, `키는 ${HEIGHT_MIN}~${HEIGHT_MAX}cm 사이로 입력해 주세요.`),
    ),
    birthYear: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ error: "출생연도를 입력해 주세요." })
        .int("출생연도는 정수로 입력해 주세요.")
        .min(BIRTH_YEAR_MIN, `${BIRTH_YEAR_MIN}년생 이후로 입력해 주세요.`)
        .max(getBirthYearMax(), `성인(${getBirthYearMax()}년생 이하)만 등록할 수 있어요.`),
    ),
    religion: z.preprocess(
      emptyToUndefined,
      z.enum(RELIGIONS, { error: "올바른 종교를 선택해 주세요." }).optional(),
    ),
    job: z
      .string()
      .trim()
      .min(1, "직업을 입력해 주세요.")
      .max(50, "직업은 50자 이하로 입력해 주세요."),
    residence: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(50, "거주지는 50자 이하로 입력해 주세요.").optional(),
    ),
    personality: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(500, "성격은 500자 이하로 입력해 주세요.").optional(),
    ),
    idealType: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(500, "이상형은 500자 이하로 입력해 주세요.").optional(),
    ),
  });
}

export type FriendFormField = keyof ReturnType<typeof createFriendSchema>["shape"];

// 목록 필터 (URL searchParams). 잘못된 값은 무시한다.
export type FriendFilters = {
  gender?: "male" | "female";
};

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): FriendFilters {
  const gender = Array.isArray(params.gender) ? params.gender[0] : params.gender;
  return { gender: gender === "male" || gender === "female" ? gender : undefined };
}
