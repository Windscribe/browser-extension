export default (whitelist = []) =>
  whitelist
    .filter(x => x.allowDirectConnect)
    .map(({ includeAllSubdomains, domain }) =>
      includeAllSubdomains
        ? [
            `*://${domain}/*`,
            `*.${domain}/*`,
            `*://${domain}(:[0-9]*)?/*`,
            `*.${domain}(:[0-9]*)?/*`,
          ]
        : [`*://${domain}/*`, `*://${domain}(:[0-9]*)?/*`],
    )

export const firefoxWhitelistTransform = (whitelist = []) =>
  whitelist
    .filter(x => x.allowDirectConnect)
    .map(({ includeAllSubdomains, domain }) =>
      includeAllSubdomains
        ? [
            `*://${domain}/*`,
            `*.${domain}/*`,
            //shExpMatch for firefox does not like the regex pattern matching, so we need to use the shellExp version for this
            `*://${domain}:*/*`,
            `*.${domain}:*/*`,
          ]
        : [`*://${domain}/*`, `*://${domain}:*/*`],
    )
