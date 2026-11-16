// Validate before constructing a pool; never include connection strings in errors.
function databaseConnection(env) {
  const value = env.MIDNIGHT_ENQUIRY_DATABASE_URL;
  try {
    if (typeof value !== 'string' || value.trim() !== value) throw Error();
    const target = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(target.protocol) || !target.hostname ||
        target.hostname !== env.MIDNIGHT_ENQUIRY_EXPECTED_HOST || !['midnight_capture','midnight_capture_live'].includes(decodeURIComponent(target.username)) || (target.searchParams.getAll('sslmode').length !== 1 || target.searchParams.get('sslmode') !== 'verify-full') || !['/midnight_enquiries','/midnight_enquiries_live'].includes(target.pathname) || target.hash) throw Error();
    // pg-connection-string can let query parameters override the URL authority.
    for (const key of target.searchParams.keys()) {
      if (!['sslmode','channel_binding','application_name','connect_timeout'].includes(key) || ['host', 'hostaddr', 'port', 'database', 'dbname', 'user', 'password'].includes(key.toLowerCase())) throw Error();
    }
    return value;
  } catch {
    throw Error('Dedicated Midnight enquiry database configuration required');
  }
}
module.exports = { databaseConnection };
