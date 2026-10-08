export default function SharedProfileNotFound() {
  return (
    <div className="flex flex-col items-center gap-2 py-24 text-center">
      <p className="text-base font-medium">열 수 없는 링크예요</p>
      <p className="text-sm text-muted-foreground">
        링크가 만료됐거나 잘못되었어요. 보내 준 분께 새 링크를 요청해 주세요.
      </p>
    </div>
  );
}
