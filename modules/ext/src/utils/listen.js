export default (api, listener, ...args) => {
  const a = [listener, ...args]
  if (!api.hasListener(...a)) {
    api.removeListener(...a)
    api.addListener(...a)

    // Return "removeListener" fn
    return () => api.removeListener(...a)
  } else {
    return () => {} // no-op
  }
}
