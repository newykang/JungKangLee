import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import {
  feedChanges,
  safeLink,
  sections,
  type FeedApp,
  type FeedUpdate,
} from "../feed/model";
import "./release-cards.css";

export function ReleaseCards({
  app,
  update,
}: {
  app: FeedApp;
  update: FeedUpdate;
}) {
  const [selected, setSelected] = useState(0);
  const [height, setHeight] = useState<number>();
  const [captureFailed, setCaptureFailed] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const slide = useRef<HTMLElement>(null);
  const capture = captureFailed ? undefined : update.releaseCaptureUrl;
  const titles = capture
    ? ["변경 요약", "스토어 캡처", "공식 원문"]
    : ["변경 요약", "공식 원문"];
  const store = safeLink(app.storeUrl);
  const source = safeLink(update.sourceUrl);
  const { items } = feedChanges(update);
  const hasSummary = sections.some(({ key }) =>
    update[key].some((line) => line.trim()),
  );
  const original = update.releaseNotes.trim();

  useEffect(() => {
    const active = slide.current;
    if (!active) return;
    const observer = new ResizeObserver(() =>
      setHeight(Math.ceil(active.getBoundingClientRect().height)),
    );
    observer.observe(active);
    return () => observer.disconnect();
  }, [selected, capture]);

  function go(page: number) {
    const container = track.current;
    if (!container || page < 0 || page >= titles.length) return;
    container.scrollTo({
      left: page * container.clientWidth,
      behavior: "instant",
    });
    setSelected(page);
  }

  return (
    <section className="ad-release-cards" aria-label="이번 버전의 변경 사항">
      <h2>이번 버전의 변경 사항</h2>
      <div className="ad-release-navigation">
        <button
          type="button"
          aria-label="이전 페이지"
          disabled={selected === 0}
          onClick={() => go(selected - 1)}
        >
          <ChevronLeft size={17} aria-hidden="true" />
        </button>
        <div
          className="ad-release-pages"
          role="group"
          aria-label="카드뉴스 페이지 선택"
        >
          {titles.map((title, index) => (
            <button
              type="button"
              key={title}
              aria-current={index === selected ? "page" : undefined}
              onClick={() => go(index)}
            >
              {title}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="다음 페이지"
          disabled={selected === titles.length - 1}
          onClick={() => go(selected + 1)}
        >
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>
      <p className="ad-release-page-number" aria-live="polite">
        {selected + 1} / {titles.length}
      </p>
      <div
        ref={track}
        className="ad-release-track"
        style={{ height }}
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          if (clientWidth)
            setSelected(
              Math.min(titles.length - 1, Math.round(scrollLeft / clientWidth)),
            );
        }}
      >
        <section
          className="ad-release-slide"
          ref={selected === 0 ? slide : undefined}
          inert={selected !== 0}
          aria-label="변경 요약"
        >
          {hasSummary ? (
            sections.map(
              ({ key, label }) =>
                update[key].length > 0 && (
                  <div key={key} className="ad-release-summary">
                    <h3>{label}</h3>
                    <ul>
                      {update[key].map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ),
            )
          ) : items.length && items[0].label !== "원문" ? (
            <div className="ad-release-summary">
              <h3>{items[0].label}</h3>
              <ul>
                {items.map((item, index) => (
                  <li key={index}>{item.text}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>공식 원문에서 변경 내용을 확인할 수 있습니다.</p>
          )}
        </section>
        {capture && (
          <section
            className="ad-release-slide"
            ref={selected === 1 ? slide : undefined}
            inert={selected !== 1}
            aria-label="스토어 캡처"
          >
            <figure>
              <a
                href={capture}
                target="_blank"
                rel="noreferrer"
                aria-label="공식 스토어 버전 기록 이미지 확대"
              >
                <img
                  src={capture}
                  alt={
                    app.name + " " + update.version + " 공식 스토어 버전 기록"
                  }
                  onError={() => setCaptureFailed(true)}
                />
              </a>
              <figcaption>
                공식 스토어 버전 기록 · 이미지를 누르면 확대됩니다
              </figcaption>
            </figure>
          </section>
        )}
        <section
          className="ad-release-slide"
          ref={selected === titles.length - 1 ? slide : undefined}
          inert={selected !== titles.length - 1}
          aria-label="공식 원문"
        >
          <h3>
            {update.notesAreExcerpt
              ? "공식 스토어 원문 발췌"
              : "공식 업데이트 원문"}
          </h3>
          <p className="ad-original">
            {original || "공개된 업데이트 원문이 없습니다."}
          </p>
          {update.notesAreExcerpt && (
            <p>
              {store || source
                ? "남은 내용은 공식 스토어에서 확인할 수 있습니다."
                : "현재 확보된 원문의 범위입니다."}
            </p>
          )}
          <div className="ad-links">
            {store && (
              <a href={store} target="_blank" rel="noreferrer">
                {update.notesAreExcerpt
                  ? "공식 스토어에서 원문 보기"
                  : "공식 스토어"}{" "}
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            )}
            {source && source !== store && (
              <a href={source} target="_blank" rel="noreferrer">
                공식 출처 <ExternalLink size={15} aria-hidden="true" />
              </a>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
