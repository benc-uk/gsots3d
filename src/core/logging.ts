// ===== logging.ts ===========================================================
// Just a simple wrapper around loglevel, so we can change the logging level
// Ben Coleman, 2023
// ============================================================================

import * as log from 'loglevel'

/**
 * Simple wrapper around loglevel, so we can change the logging level
 * @param level - The log level to set, one of 'trace', 'debug', 'info', 'warn', 'error', 'silent'
 */
export function setLogLevel(level: log.LogLevelNames) {
  log.setLevel(level)
}
