"use client";

import { useActionState } from "react";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, type LoginState } from "@/features/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FormField name="password" label="비밀번호" required error={state.error}>
        {(props) => (
          <Input
            {...props}
            name="password"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            autoFocus
          />
        )}
      </FormField>
      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "확인 중..." : "들어가기"}
      </Button>
    </form>
  );
}
