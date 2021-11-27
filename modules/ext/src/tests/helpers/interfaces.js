const Serverlist = {
  id: Number,
  name: String,
  country_code: String,
  status: Number,
  premium_only: Number,
  short_name: String,
  p2p: Number,
  tz: String,
  tz_offset: String,
  loc_type: String,
  groups: Array,
}

const ServerlistGroup = {
  id: Number,
  city: String,
  nick: String,
  pro: Number,
  gps: String,
  tz: String,
}

module.exports = {
  Serverlist,
  ServerlistGroup,
}
