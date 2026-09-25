import { QuartzComponent, QuartzComponentConstructor } from "./types"

/**
 * Floating feedback button and form. Behaviour and styling live in
 * quartz/static/feedback.js and feedback.css; the Static emitter copies them
 * to /static/. Added to afterBody for every page type except 404 by
 * loadQuartzLayout in quartz/plugins/loader/config-loader.ts.
 *
 * The <link> and <script> sit here rather than in <head>: SPA navigation
 * swaps the head's contents on every page, but morphs the body in place, so
 * they load once and stay.
 */
export default (() => {
  const Feedback: QuartzComponent = () => {
    return (
      <>
        <link rel="stylesheet" href="/static/feedback.css" />
        <script src="/static/feedback.js" defer></script>
        <button
          id="fb-btn"
          type="button"
          aria-label="Share feedback"
          aria-controls="fb-panel"
          aria-expanded="false"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="m3.5 7 8.5 6 8.5-6" />
          </svg>
        </button>
        <div id="fb-panel" role="dialog" aria-modal="true" aria-labelledby="fb-title">
          <div id="fb-header">
            <div>
              <h2 id="fb-title">Noticed something?</h2>
              <p id="fb-subtitle">A correction, a connection, an idea — every note helps.</p>
            </div>
            <button id="fb-close" type="button" aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div id="fb-body">
            <label for="fb-message">Message</label>
            {/* 3,500: what the Worker accepts, so a Telegram message fits. */}
            <textarea
              id="fb-message"
              rows={5}
              maxlength={3500}
              placeholder="What did you notice?"
            ></textarea>
            <label for="fb-email">
              Email <span class="fb-optional">optional</span>
            </label>
            <input
              id="fb-email"
              type="email"
              autocomplete="email"
              placeholder="Only if you'd like a reply"
            />
            {/* Honeypot: off-screen, out of the tab order and hidden from
                screen readers. Only a bot fills it in; the Worker then
                drops the message. */}
            <input
              id="fb-website"
              type="text"
              name="website"
              tabindex={-1}
              autocomplete="off"
              aria-hidden="true"
            />
            <div id="fb-actions">
              <span id="fb-hint">Ctrl + Enter to send</span>
              <button id="fb-send" type="button">
                Send
              </button>
            </div>
            <p id="fb-status" aria-live="polite"></p>
          </div>
        </div>
      </>
    )
  }

  return Feedback
}) satisfies QuartzComponentConstructor
