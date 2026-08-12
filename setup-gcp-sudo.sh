#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: This script must be run as root or with sudo."
  echo "Usage: sudo bash setup-gcp-sudo.sh [username]"
  exit 1
fi

TARGET_USER="${1:-${SUDO_USER:-${LOGNAME:-}}}"
if [ -z "$TARGET_USER" ]; then
  echo "ERROR: Cannot determine the target user."
  echo "Usage: sudo bash setup-gcp-sudo.sh [username]"
  exit 1
fi

if ! id "$TARGET_USER" >/dev/null 2>&1; then
  echo "Creating user '$TARGET_USER'..."
  adduser --disabled-password --gecos "" "$TARGET_USER"
fi

echo "Adding '$TARGET_USER' to the sudo group..."
usermod -aG sudo "$TARGET_USER"

SUDOERS_FILE="/etc/sudoers.d/99-${TARGET_USER}-nopasswd"
cat > "$SUDOERS_FILE" <<EOF
# Passwordless sudo for user $TARGET_USER
$TARGET_USER ALL=(ALL) NOPASSWD:ALL
EOF
chmod 0440 "$SUDOERS_FILE"

echo "Installing recommended packages..."
apt update
apt install -y git curl build-essential nginx postgresql postgresql-contrib tmux

cat <<EOF

Setup complete.
- User: $TARGET_USER
- Passwordless sudo has been enabled for this user.
- Recommended packages have been installed.

If you are using browser SSH and the current session still behaves inconsistently, reconnect the SSH session and log in again.
If you want a dedicated deploy user, run this script with a username argument, for example:
  sudo bash setup-gcp-sudo.sh deploy
EOF
