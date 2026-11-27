import { ReviewControls, ReviewLoadError, ReviewSaveError } from '../../features/reviews/ReviewControls'
import { useSharedReviews } from '../../features/reviews/useSharedReviews'

export default function ReleaseReview({ id, version }: { id: string; version: string }) {
  const reviews = useSharedReviews(new URLSearchParams({ releaseId: id }).toString())
  const summary = reviews.data?.reviews[0]

  return <section className="pane">
    <h2>이 버전은 어땠나요?</h2>
    <p className="subtext">v{version} · 이 브라우저에서 한 표를 남길 수 있어요.</p>
    {reviews.loading && <p role="status">평가를 불러오는 중입니다.</p>}
    {reviews.error && <ReviewLoadError error={reviews.error} retry={reviews.retry} />}
    {reviews.saveError && <ReviewSaveError message={reviews.saveError} retry={reviews.retry} />}
    {summary && reviews.data &&
      <ReviewControls summary={summary} version={version} canVote={reviews.data.canVote} saving={reviews.saving} expandedReasons
        onVote={(choice, reasons) => reviews.castVote(summary, choice, reasons)} />
    }
  </section>
}
