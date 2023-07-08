// ===== logging.ts ===========================================================
// Just a wrapper around loglevel
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'

/**
 * Wrapper around loglevel, so we can globally change the logging level
 * @param level - The log level to set, one of 'trace', 'debug', 'info', 'warn', 'error', 'silent'
 */
export function setLogLevel(level: log.LogLevelNames) {
  log.setLevel(level)
}
