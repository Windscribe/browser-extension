import { IS_CHROME } from 'utils/constants'

export const detectUblock = async () => {
  try {
    const ublockInfo = await browser.management.get(
      // extension id for ublock
      IS_CHROME
        ? 'cjpalhdlnbpafiamejdnhcphjbkeiagm'
        : 'uBlock0@raymondhill.net',
    )
    return ublockInfo.enabled
  } catch (e) {
    return false
  }
}
