export default url =>
  new window.URL(url).hostname
    .split('.')
    .reduceRight((p, c) => [...p, [c].concat(p.slice(-1)).join('.')], [])
    .reverse()
    .slice(0, -1)
