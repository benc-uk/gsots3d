// ===== logging.ts ===========================================================
// Just a simple wrapper around loglevel, so we can change the logging level
// Ben Coleman, 2023
// ============================================================================

import * as log from 'loglevel'

export function setLogLevel(level: log.LogLevelNames) {
  log.setLevel(level)
}
