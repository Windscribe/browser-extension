import { injectGlobal } from 'emotion'
import plexSansBold from './plex-sans-bold.woff'
import plexSansBold2 from './plex-sans-bold.woff2'
import plexSans from './plex-sans-regular.woff'
import plexSans2 from './plex-sans-regular.woff'

injectGlobal`
  @font-face {
    font-family: 'plex-sans';
    font-style: normal;
    font-weight: 700;
    src: url(${plexSansBold2}) format('woff2'), url(${plexSansBold}) format('woff');
  }

  @font-face {
    font-family: 'plex-sans';
    font-style: normal;
    font-weight: 400;
    src: url(${plexSans}) format('woff2'), url(${plexSans2}) format('woff')
  }

  * { font-family: 'plex-sans' !important; }
`
