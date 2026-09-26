#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${NVM_DIR:-}" && -s "${NVM_DIR}/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    source "${NVM_DIR}/nvm.sh"
elif [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    source "${HOME}/.nvm/nvm.sh"
elif command -v fnm >/dev/null 2>&1; then
    eval "$(fnm env)"
fi

exec npx -y chrome-devtools-mcp@1.9.0 --autoConnect --no-usage-statistics
