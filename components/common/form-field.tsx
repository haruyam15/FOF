import type { ReactNode } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

// 필수/선택 표시 디자인은 이 파일에서만 관리한다.
function RequiredMark() {
  return (
    <span className="text-primary mt-1" aria-hidden="true">
      *
    </span>
  );
}

function OptionalMark() {
  return (
    <span className="text-xs font-normal text-muted-foreground">(선택)</span>
  );
}

type FormFieldControlProps = {
  id: string;
  'aria-invalid': boolean;
};

type FormFieldProps = {
  /** 입력 요소의 id로도 사용된다. */
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  /** 입력 요소와 에러 문구 사이에 표시할 보조 내용 */
  hint?: ReactNode;
  className?: string;
  /** 입력 요소를 렌더링한다. 받은 props(id, aria-invalid)를 입력 요소에 그대로 펼쳐서 쓴다. */
  children: (props: FormFieldControlProps) => ReactNode;
};

// 라벨 + (필수/선택) 표시 + 입력 요소 + 에러 문구를 하나로 묶은 폼 필드.
export function FormField({
  name,
  label,
  required = false,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const invalid = !!error;

  return (
    <Field data-invalid={invalid} className={className}>
      <FieldLabel htmlFor={name}>
        <div className="flex items-center gap-1">
          {label}
          {required ? <RequiredMark /> : <OptionalMark />}
        </div>
      </FieldLabel>
      {children({ id: name, 'aria-invalid': invalid })}
      {hint}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
