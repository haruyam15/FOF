'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/common/form-field';
import { FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { createFriend, type CreateFriendState } from '../actions';
import { ImagePicker } from './image-picker';
import {
  BIRTH_YEAR_MIN,
  GENDERS,
  HEIGHT_MAX,
  HEIGHT_MIN,
  RELIGIONS,
} from '../fields';

const initialState: CreateFriendState = {};

export function FriendForm() {
  const [state, formAction, pending] = useActionState(
    createFriend,
    initialState,
  );
  const { errors = {}, values = {} } = state;
  const [compressing, setCompressing] = useState(false);
  const [imageError, setImageError] = useState<string>();

  const imageMessage = imageError ?? errors.image;

  return (
    <form
      key={state.nonce}
      action={formAction}
      noValidate
      autoComplete="off"
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <FormField name="image" label="사진" error={imageMessage}>
          {({ id, 'aria-invalid': invalid }) => (
            <ImagePicker
              id={id}
              name="image"
              invalid={invalid}
              onBusyChange={setCompressing}
              onErrorChange={setImageError}
            />
          )}
        </FormField>

        <FormField name="name" label="이름" required error={errors.name}>
          {(field) => (
            <Input
              {...field}
              name="name"
              autoComplete="off"
              defaultValue={values.name}
              maxLength={30}
              required
            />
          )}
        </FormField>

        <FormField name="gender" label="성별" required error={errors.gender}>
          {({ id, ...field }) => (
            <RadioGroup
              id={id}
              name="gender"
              defaultValue={values.gender}
              className="flex gap-6"
              required
            >
              {GENDERS.map((g) => (
                <div key={g.value} className="flex min-h-11 items-center gap-2">
                  <RadioGroupItem
                    {...field}
                    id={`gender-${g.value}`}
                    value={g.value}
                  />
                  <Label htmlFor={`gender-${g.value}`}>{g.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="birthYear"
            label="출생연도"
            required
            error={errors.birthYear}
          >
            {(field) => (
              <Input
                {...field}
                name="birthYear"
                type="number"
                inputMode="numeric"
                placeholder="1996"
                min={BIRTH_YEAR_MIN}
                defaultValue={values.birthYear}
                required
              />
            )}
          </FormField>

          <FormField
            name="heightCm"
            label="키 (cm)"
            required
            error={errors.heightCm}
          >
            {(field) => (
              <Input
                {...field}
                name="heightCm"
                type="number"
                inputMode="numeric"
                placeholder="170"
                min={HEIGHT_MIN}
                max={HEIGHT_MAX}
                defaultValue={values.heightCm}
                required
              />
            )}
          </FormField>
        </div>

        <FormField name="job" label="직업" required error={errors.job}>
          {(field) => (
            <Input
              {...field}
              name="job"
              autoComplete="off"
              defaultValue={values.job}
              maxLength={50}
              required
            />
          )}
        </FormField>

        <FormField name="residence" label="거주지" error={errors.residence}>
          {(field) => (
            <Input
              {...field}
              name="residence"
              autoComplete="off"
              placeholder="예) 서울 마포구"
              defaultValue={values.residence}
              maxLength={50}
            />
          )}
        </FormField>

        <FormField name="religion" label="종교" error={errors.religion}>
          {(field) => (
            <select
              {...field}
              name="religion"
              defaultValue={values.religion ?? ''}
              className="h-11 w-full rounded-lg border border-input aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">선택 안 함</option>
              {RELIGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField name="personality" label="성격" error={errors.personality}>
          {(field) => (
            <Textarea
              {...field}
              name="personality"
              rows={3}
              maxLength={500}
              placeholder="예) 차분하고 배려심이 많아요"
              defaultValue={values.personality}
            />
          )}
        </FormField>

        <FormField name="idealType" label="이상형" error={errors.idealType}>
          {(field) => (
            <Textarea
              {...field}
              name="idealType"
              rows={4}
              maxLength={500}
              defaultValue={values.idealType}
            />
          )}
        </FormField>
      </FieldGroup>

      {state.message && <FieldError>{state.message}</FieldError>}

      <Button type="submit" size="lg" disabled={pending || compressing}>
        {pending ? '등록 중...' : '친구 등록'}
      </Button>
    </form>
  );
}
