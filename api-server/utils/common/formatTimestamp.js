function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const pad = (n, z = 2) => ('00' + n).slice(-z);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const sec = pad(date.getUTCSeconds());
  const ms = pad(date.getUTCMilliseconds(), 3);
  // Microseconds: get from isoString if present
  let micro = '000000';
  const match = isoString.match(/\.(\d{1,6})/);
  if (match) micro = (match[1] + '000000').slice(0, 6);
  return `${year}-${month}-${day} ${hour}:${min}:${sec}.${micro}`;
}

module.exports = { formatTimestamp };
