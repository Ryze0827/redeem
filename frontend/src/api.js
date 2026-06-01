async function parseResponse(response) {
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { success: false, msg: text || response.statusText }
  }

  if (!response.ok) {
    const message = data?.msg || data?.message || response.statusText
    throw new Error(message)
  }

  return data
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      ...(options.headers || {}),
    },
    ...options,
  })

  return parseResponse(response)
}

export function getStock() {
  return request('/api/stock')
}

export function checkCdkey(cdkey) {
  return request('/api/check', {
    method: 'POST',
    body: JSON.stringify({ cdkey }),
  })
}

export function queryStatus(cdkey) {
  return request('/api/status', {
    method: 'POST',
    body: JSON.stringify({ cdkey }),
  })
}

export function submitRecharge({ cdkey, sessionInfo, force }) {
  return request('/api/activate', {
    method: 'POST',
    body: JSON.stringify({
      cdkey,
      session_info: sessionInfo,
      ...(force ? { force: 1 } : {}),
    }),
  })
}
