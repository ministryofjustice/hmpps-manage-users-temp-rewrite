/* global hljs */
/* eslint-disable no-unused-vars */
function jwtDecode(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch (_e) {
    return null
  }
}
/* eslint-enable no-unused-vars */

function renderSessionList(allSessions) {
  const list = document.getElementById('sessionList')
  list.innerHTML = ''
  const entries = Array.isArray(allSessions)
    ? allSessions.map(s => ({ id: s.id, session: s }))
    : Object.keys(allSessions).map(id => ({ id, session: allSessions[id] }))

  entries.forEach(entry => {
    const { session, id: sessionId } = entry
    // In the rewrite, passport stores { token, username, authSource } — username is available directly
    const username = (session.passport && session.passport.user && session.passport.user.username) || 'unknown'
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = '#'
    a.className = 'govuk-link'
    a.textContent = `${username} / ${sessionId}`
    a.addEventListener('click', e => {
      e.preventDefault()
      // In the rewrite, the token is stored as passport.user.token (not access_token)
      const token = session.passport && session.passport.user && session.passport.user.token
      const decoded = token ? jwtDecode(token) : null
      const panel = document.getElementById('sessionTokenDecoded')
      const pre = document.getElementById('sessionTokenPre')
      pre.textContent = JSON.stringify(decoded || { error: 'No token in session' }, null, 2)
      pre.className = 'debug-session-pre language-json'
      pre.removeAttribute('data-highlighted')
      hljs.highlightElement(pre)
      panel.classList.remove('debug-session-token-decoded')
    })
    li.appendChild(a)
    list.appendChild(li)
  })
}

function render(id, data) {
  const el = document.getElementById(id)
  el.textContent = JSON.stringify(data, null, 2)
  el.className = 'debug-session-pre language-json'
  hljs.highlightElement(el)
}

function initCopyButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.debug-session-copy')
    if (!btn) return
    const target = document.getElementById(btn.getAttribute('data-target'))
    if (!target) return
    navigator.clipboard.writeText(target.textContent).then(() => {
      const original = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => {
        btn.textContent = original
      }, 2000)
    })
  })
}

fetch('/debug/session')
  .then(res => res.json())
  .then(data => {
    // In the rewrite, username is stored directly in passport.user.username
    const passportUser = data.currentSession && data.currentSession.passport && data.currentSession.passport.user
    const username = passportUser && passportUser.username
    if (username) {
      document.getElementById('pageTitle').textContent = `Session Data: ${username}`
    }
    render('decodedToken', data.decodedToken)
    render('sessionCookie', data.sessionCookie)
    render('currentSession', data.currentSession)
    render('locals', data.locals)
    render('allSessions', data.allSessions)
    renderSessionList(data.allSessions)
    document.getElementById('sessionStoreType').textContent =
      `Session store: ${data.usingRedis ? 'Redis' : 'In-memory'}`
    initCopyButtons()
  })
  .catch(err => {
    document.querySelectorAll('.debug-session-pre').forEach(el => {
      // eslint-disable-next-line no-param-reassign
      el.textContent = `Error: ${err.message}`
    })
  })
