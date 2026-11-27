import { ReviewControls, ReviewLoadError, ReviewSignIn } from '../../features/reviews/ReviewControls'
import { useSharedReviews } from '../../features/reviews/useSharedReviews'

export default function ReleaseReview({ id, version }: { id: string; version: string }) {
  const reviews = useSharedReviews(new URLSearchParams({ releaseId: id }).toString())
  const summary = reviews.data?.reviews[0]

  return <section className="pane">
    <h2>이 버전은 어땠나요?</h2>
    <p className="subtext">v{version} · 커뮤니티 평가</p>
    {reviews.loading && <p role="status">평가를 불러오는 중입니다.</p>}
    {reviews.error && <ReviewLoadError error={reviews.error} retry={reviews.retry} />}
    {reviews.saveError && <p role="status" className="mt-2 text-sm text-amber-800">{reviews.saveError}</p>}
    {summary && reviews.data && <>
      <ReviewControls summary={summary} version={version} signedIn={reviews.data.signedIn} saving={reviews.saving}
        onVote={choice => void reviews.castVote(summary, choice)} />
      {!reviews.data.signedIn && <ReviewSignIn returnHash={window.location.hash} />}
    </>}
  </section>
}
