const _raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://102.68.86.20:3001'
// Always end with "/" so callers can safely write `${API_URL}path` without
// worrying about whether the env var has a trailing slash or not.
export const API_URL = _raw.endsWith('/') ? _raw : `${_raw}/`

