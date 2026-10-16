const WORKER_URL = "https://tadabbur-feedback.tadabbur-feedback.workers.dev"

/*
 * Feedback widget. Markup comes from quartz/components/Feedback.tsx, styles
 * from feedback.css. One Send = one POST of { message, email, page, website }
 * to the Worker in feedback-worker/, which forwards it to Telegram.
 *
 * Every listener is on `document` and looks the elements up by id when it
 * fires. SPA navigation morphs <body> in place and this script only runs once,
 * so nothing here may hold on to an element between events.
 */
;(function () {
  const THANKS = "JazakAllah khair. Your feedback has been received."
  const FAILED = "Something went wrong. Please try again."
  const THANKS_MS = 2500
  // The button asks once, on the page where a reader reaches this many.
  const ASK_AFTER = 5
  const PAGES = "tadabbur:fb-pages"
  const ASKED = "tadabbur:fb-asked"
  const PLACEHOLDER = "What did you notice?"

  const $ = (id) => document.getElementById(id)
  const isOpen = () => $("fb-panel")?.classList.contains("fb-open") ?? false

  let closeTimer = null

  function setStatus(text, isError) {
    const status = $("fb-status")
    if (!status) return
    status.textContent = text
    status.classList.toggle("fb-error", !!isError)
  }

  function reset() {
    clearTimeout(closeTimer)
    closeTimer = null
    const panel = $("fb-panel")
    panel?.classList.remove("fb-sent")
    const send = $("fb-send")
    if (send) {
      send.disabled = false
      send.textContent = "Send"
    }
    setStatus("")
  }

  // Storage can be refused (private browsing): then the button never asks.
  const store = {
    get(key) {
      try {
        return localStorage.getItem(key)
      } catch {
        return "1"
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value)
      } catch {}
    },
  }

  function hideNudge() {
    const nudge = $("fb-nudge")
    if (nudge) nudge.hidden = true
  }

  // `about` names what the message is about ("Al-Baqarah 2:255") when the
  // form was opened from a page's own "Tell us".
  function open(about) {
    const panel = $("fb-panel")
    if (!panel) return
    reset()
    hideNudge()
    store.set(ASKED, "1")
    const aboutLine = $("fb-about")
    if (aboutLine) {
      aboutLine.textContent = about ? `About ${about}` : ""
      aboutLine.hidden = !about
    }
    const message = $("fb-message")
    if (message) {
      message.placeholder = about ? "What is wrong or missing here?" : PLACEHOLDER
    }
    panel.classList.add("fb-open")
    $("fb-btn")?.setAttribute("aria-expanded", "true")
    // The panel becomes visible on the next frame; focus fails before that.
    requestAnimationFrame(() => $("fb-message")?.focus())
  }

  function close(returnFocus = true) {
    const panel = $("fb-panel")
    if (!panel) return
    panel.classList.remove("fb-open")
    const btn = $("fb-btn")
    btn?.setAttribute("aria-expanded", "false")
    reset()
    if (returnFocus) btn?.focus()
  }

  function currentPage() {
    // Surah folders have Arabic names; send them readable, not %D8%A7…
    try {
      return decodeURI(window.location.pathname)
    } catch {
      return window.location.pathname
    }
  }

  async function send() {
    const messageEl = $("fb-message")
    const emailEl = $("fb-email")
    const sendBtn = $("fb-send")
    if (!messageEl || !emailEl || !sendBtn || sendBtn.disabled) return

    const message = messageEl.value.trim()
    const email = emailEl.value.trim()
    if (!message) {
      setStatus("Please write a message first", true)
      messageEl.focus()
      return
    }
    if (email && !emailEl.checkValidity()) {
      setStatus("That email address doesn't look right", true)
      emailEl.focus()
      return
    }

    sendBtn.disabled = true
    sendBtn.textContent = "Sending..."
    setStatus("")

    let ok = false
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          email,
          page: currentPage(),
          // Honeypot (see Feedback.tsx): empty unless a bot filled it.
          website: $("fb-website")?.value ?? "",
        }),
      })
      ok = res.ok
    } catch {
      ok = false
    }

    if (ok) {
      messageEl.value = ""
      emailEl.value = ""
      $("fb-panel")?.classList.add("fb-sent")
      setStatus(THANKS)
      // The fields just vanished from under the focus; keep it in the panel.
      $("fb-close")?.focus()
      closeTimer = setTimeout(() => {
        if (isOpen()) close()
      }, THANKS_MS)
    } else {
      const btn = $("fb-send")
      if (btn) {
        btn.disabled = false
        btn.textContent = "Send"
      }
      setStatus(FAILED, true)
    }
  }

  function focusables() {
    const panel = $("fb-panel")
    if (!panel) return []
    return Array.from(panel.querySelectorAll("button, textarea, input")).filter(
      (el) => !el.disabled && el.tabIndex >= 0 && el.offsetParent !== null,
    )
  }

  document.addEventListener("click", (e) => {
    const target = e.target
    if (!(target instanceof Element)) return

    if (target.closest("#fb-btn")) {
      isOpen() ? close() : open()
      return
    }
    if (target.closest("#fb-nudge-open")) {
      open()
      return
    }
    if (target.closest("#fb-nudge-close")) {
      hideNudge()
      store.set(ASKED, "1")
      $("fb-btn")?.focus()
      return
    }
    const asked = target.closest("[data-feedback]")
    if (asked) {
      open(asked.getAttribute("data-feedback") || "")
      return
    }
    if (target.closest("#fb-close")) {
      close()
      return
    }
    if (target.closest("#fb-send")) {
      send()
      return
    }
    // Outside click. Don't steal focus back to the button: the reader has
    // just clicked something else.
    if (isOpen() && !target.closest("#fb-panel")) close(false)
  })

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return

    if (e.key === "Escape") {
      e.preventDefault()
      close()
      return
    }

    // Ctrl/Cmd+Enter sends from the textarea.
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && e.target === $("fb-message")) {
      e.preventDefault()
      send()
      return
    }

    // aria-modal: keep Tab inside the panel while it's open.
    if (e.key === "Tab") {
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const panel = $("fb-panel")
      if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })

  // SPA navigation: leave the next page with the panel closed.
  document.addEventListener("prenav", () => {
    if (isOpen()) close(false)
    hideNudge()
  })

  // Every page counts towards the one time the button asks.
  document.addEventListener("nav", () => {
    if (store.get(ASKED)) return
    const pages = (parseInt(store.get(PAGES) || "0", 10) || 0) + 1
    store.set(PAGES, String(pages))
    if (pages < ASK_AFTER) return
    const nudge = $("fb-nudge")
    if (!nudge) return
    nudge.hidden = false
    store.set(ASKED, "1")
  })
})()
