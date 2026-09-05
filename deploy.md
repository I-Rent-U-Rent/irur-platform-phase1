# Deployment Guide: GCP VM, PostgreSQL, PM2, and NGINX

This guide explains how to deploy the `irur-platform-phase1` app on a Google Cloud Platform VM using the GCP Console only. It covers creating the VM, installing dependencies, configuring PostgreSQL, building the app, and running it with PM2 and NGINX.

---

## 1. Prepare the GCP Project

1. Open the Google Cloud Console: https://console.cloud.google.com/
2. Select your project or create a new project.
3. Enable the following APIs if not already enabled:
   - Compute Engine API
   - Cloud Resource Manager API

---

## 2. Create a VM Instance

1. In the Console, go to `Compute Engine` > `VM instances`.
2. Click `Create instance`.
3. Configure the VM:
   - Name: `irur-vm`
   - Region and zone: choose a location near your users.
   - Machine type: use `e2-medium` for a light deployment or `e2-standard-4` for more capacity.
   - Boot disk: `Ubuntu 24.04 LTS` or `Debian 12`.
   - Disk size: at least `50 GB`.
   - Disk type: `Balanced persistent disk` or `SSD persistent disk`.
4. Under `Firewall`, check:
   - `Allow HTTP traffic`
   - `Allow HTTPS traffic`
5. Click `Create`.

### 2.6 Optional: use the startup script field in the VM creation page

If you want the VM to automatically prepare the OS for deployment, paste the following into the `Automation > Startup script` field on the VM creation page:

```bash
#!/bin/bash
set -euo pipefail

TARGET_USER="deploy"
MARKER_FILE="/usr/local/bin/gcp-sudo-setup-done"

if [ ! -f "$MARKER_FILE" ]; then
  if ! id "$TARGET_USER" >/dev/null 2>&1; then
    adduser --disabled-password --gecos "" "$TARGET_USER"
  fi

  usermod -aG sudo "$TARGET_USER"

  cat > /etc/sudoers.d/99-${TARGET_USER}-nopasswd <<'EOF'
$TARGET_USER ALL=(ALL) NOPASSWD:ALL
EOF
  chmod 0440 /etc/sudoers.d/99-${TARGET_USER}-nopasswd

  apt update
  apt install -y git curl build-essential nginx postgresql postgresql-contrib tmux

  touch "$MARKER_FILE"
fi
```

This startup script:
- creates a `deploy` user if it does not exist
- adds the user to the `sudo` group
- gives passwordless sudo for that user
- installs Git, Curl, build tools, NGINX, PostgreSQL, and Tmux
- runs only once thanks to the marker file

After the VM boots, connect again and use the `deploy` user or the default SSH user. If your current SSH shell has permission issues, reconnect.

---

## 3. Reserve a Static External IP (Recommended)

1. Go to `VPC network` > `External IP addresses`.
2. Click `Reserve static address`.
3. Enter a name like `irur-static-ip`.
4. Choose the same region as your VM.
5. Click `Reserve`.
6. Attach the reserved IP to your VM under `Compute Engine` > `VM instances` > `Edit` > `Network interfaces` > `External IP`.

---

## 4. Open the VM SSH Session

1. In `Compute Engine` > `VM instances`, click the `SSH` button for `irur-vm`.
2. A browser SSH window opens. Use this terminal to run installation commands.

> If your browser SSH disconnects, reconnect from the GCP Console. For longer processes, use `tmux` or `screen` inside the VM.

---

## 5. Set up a reliable sudo user and install dependencies automatically

Use the automation script to avoid intermittent sudo issues on Ubuntu 26.04.

### 5.1 Copy the helper script to the VM

In your SSH terminal, create the script file:

```bash
cat > /tmp/setup-gcp-sudo.sh <<'EOF'
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
cat > "$SUDOERS_FILE" <<EOFS
# Passwordless sudo for user $TARGET_USER
$TARGET_USER ALL=(ALL) NOPASSWD:ALL
Defaults:$TARGET_USER !authenticate
EOFS
chmod 0440 "$SUDOERS_FILE"

echo "Installing recommended packages..."
apt update
apt install -y git curl build-essential nginx postgresql postgresql-contrib tmux

cat <<EOFM

Setup complete.
- User: $TARGET_USER
- Passwordless sudo has been enabled for this user.
- Recommended packages have been installed.

If you are using browser SSH and the current session still behaves inconsistently, reconnect the SSH session and log in again.
If you want a dedicated deploy user, run this script with a username argument, for example:
  sudo bash /tmp/setup-gcp-sudo.sh deploy
EOFM
EOF
```

### 5.2 Run the helper script

```bash
sudo bash /tmp/setup-gcp-sudo.sh
```

If you want to set up a dedicated deploy user, use:

```bash
sudo bash /tmp/setup-gcp-sudo.sh deploy
```

This ensures:
- your SSH user is added to `sudo`
- passwordless sudo is enabled for the user
- the required packages are installed
- the environment is stable for deployment commands

---

## 6. Install Node.js

Install Node.js 24.x because the repo requires Node >= 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 6. Install Node.js

Install Node.js 24.x because the repo requires Node >= 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 7. Install PostgreSQL

Install PostgreSQL and start it:

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

---

## 8. Create PostgreSQL User and Database

Inside the VM SSH terminal:

```bash
sudo -u postgres psql
```

### Option A: use a dedicated DB user (recommended)

In the `psql` prompt, run:

```sql
CREATE USER irur_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE irur OWNER irur_user;
GRANT ALL PRIVILEGES ON DATABASE irur TO irur_user;
\q
```

> Replace `your_strong_password` with a secure password.

### Option B: use the built-in `postgres` DB user with password `root`

If you want to connect with the `postgres` database user and password `root`, run:

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'root';"
sudo -u postgres createdb irur2
```

Then use this `server/.env` configuration:

```bash
cat > server/.env <<'EOF'
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=irur2
PORT=3001
NODE_ENV=production
EOF
```

> Using `postgres` with password `root` is less secure than creating a dedicated DB user. Only use this when you explicitly need that username/password combination.

---

## 9. Clone Your Repo to the VM

From the SSH terminal:

```bash
cd /opt
sudo mkdir -p /opt/irur
sudo chown $USER:$USER /opt/irur
cd /opt/irur
git clone <YOUR_REPO_URL> .
```

> Replace `<YOUR_REPO_URL>` with your GitHub repository URL.

---

## 10. Install App Dependencies

From the repo root in `/opt/irur`:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

---

## 11. Create Production Environment Variables

Create `server/.env` with the VM database, port, and **security** settings:

```bash
cat > server/.env <<'EOF'
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=irur_user
DB_PASSWORD=your_strong_password
DB_NAME=irur
PORT=3001
NODE_ENV=production

# --- Security (required in production) ---
# The app REFUSES TO START if JWT_SECRET is unset. Generate with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=replace_with_a_long_random_string

# Initial admin/employee accounts are seeded from these on an empty DB.
# Never commit real values. Rotate existing accounts with scripts/rotate-credentials.ts.
SEED_ADMIN_EMAIL=admin@irur.com
SEED_ADMIN_PASSWORD=replace_with_a_strong_password
SEED_EMPLOYEE_EMAIL=employee@irur.com
SEED_EMPLOYEE_PASSWORD=replace_with_a_strong_password
EOF
```

> Use the password you created in PostgreSQL for `DB_PASSWORD`.
> `JWT_SECRET`, `DB_PASSWORD`, `SEED_ADMIN_PASSWORD`, and `SEED_EMPLOYEE_PASSWORD` have **no insecure defaults** — the server exits on boot if they are missing in production. Set them before deploying.

---

## 12. Build the App

From the repo root:

```bash
npm run build
```

This builds both the client and the server and outputs:
- `client/dist`
- `server/dist/index.js`

---

## 13. Install PM2

Install PM2 globally and configure startup:

```bash
sudo npm install -g pm2
pm2 start server/dist/index.js --name irur --env production
pm2 save
sudo pm2 startup systemd -u $USER --hp $HOME
```

If the `pm2 startup` command prints an additional command, run it exactly as shown.

---

## 14. Configure NGINX as a Reverse Proxy

1. Remove the default site if desired:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

2. Create an NGINX site config:

```bash
sudo tee /etc/nginx/sites-available/irur <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

3. Enable the site and restart NGINX:

```bash
sudo ln -s /etc/nginx/sites-available/irur /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 15. Open Firewall Rules in GCP

In the Cloud Console, go to `VPC network` > `Firewall` > `Create firewall rule` if needed.

Set:
- Name: `allow-http`
- Targets: `All instances in the network` or the specific VM network
- Source IP ranges: `0.0.0.0/0`
- Protocols and ports: `tcp:80`

If you want HTTPS later, create a rule for `tcp:443`.

---

## 16. Verify the Deployment

Open a browser and visit:

- `http://YOUR_VM_IP/`

If you use a reserved static IP, use that IP.

Test the API directly:

- `http://YOUR_VM_IP/api/health`

Expected response:

```json
{ "ok": true, "time": "..." }
```

---

## 17. Update the App After Code Changes

When you change code, do the following from the VM repo root:

```bash
git pull
npm run build
pm2 restart irur
```

This rebuilds both front-end and back-end, then reloads the running process.

---

## 18. Useful Commands

- Check Node process status: `pm2 status`
- View logs: `pm2 logs irur`
- Restart the app: `pm2 restart irur`
- Stop the app: `pm2 stop irur`
- Start the app after reboot: `pm2 resurrect`

---

## 19. Optional: Enable HTTPS with Certbot

If you have a domain, use Certbot for HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Then follow the prompts to automatically configure SSL.

---

## 20. Troubleshooting

- If the app is not reachable, check:
  - `sudo systemctl status nginx`
  - `pm2 status`
  - `pm2 logs irur`
  - `sudo nginx -t`
- If PostgreSQL fails, verify `server/.env` and database credentials.
- If you need SSH reconnects, use the GCP Console SSH again and verify your user still has `sudo`.

---

## Notes

- This deployment stores the database locally on the VM.
- The app uses `server/dist/index.js` in production.
- The React app is served by the backend when `NODE_ENV=production`.
- You do not need to expose port `3001` publicly if NGINX is proxying traffic on port `80`.

---

## New-Lead Notifications (Email / WhatsApp)

Every submission to `POST /api/leads` (contact form, property enquiry, and
session booking) triggers an alert. Both channels are optional and switch on
only when their variables are present in `server/.env`. Alerts are sent *after*
the HTTP response and are never awaited, so a slow or broken provider can never
delay or fail a visitor's form submission.

### Option A — Gmail (recommended, free)

1. The Gmail account must have **2-Step Verification** enabled.
2. Go to **Google Account → Security → 2-Step Verification → App passwords**,
   create one for "Mail", and copy the 16-character code.
3. Add to `server/.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youraddress@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=IRENTURENT Website <youraddress@gmail.com>
LEAD_NOTIFY_TO=youraddress@gmail.com,partner@gmail.com
```

`LEAD_NOTIFY_TO` accepts a comma-separated list. Use the app password, not the
account password. The alert's `Reply-To` is set to the lead, so replying in
Gmail goes straight to the customer.

> **GCP note:** Google Cloud permanently blocks outbound TCP **port 25**. Ports
> **587** and **465** are open, so Gmail SMTP works from the VM. Keep
> `SMTP_PORT=587` (or `465`) — never `25`.

Free Gmail sending is capped around 500 messages/day, which is far above
expected lead volume.

### Option B — WhatsApp via Twilio (optional)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+17174336793
```

- For testing, use the **Twilio WhatsApp Sandbox** (Messaging → Try it out).
  Join it from your phone once; the sandbox session lapses after 72 hours of
  inactivity and must be rejoined.
- For production you need a WhatsApp Business sender and, because these are
  business-initiated messages, a **pre-approved message template**. Free-form
  text only reaches you inside a 24-hour window after you message the number.
  Budget a few days for Meta's approval.

### Apply and verify

```bash
cd ~/irur-platform-phase1
pm2 restart irur
pm2 logs irur --lines 20
```

On boot the server prints which channels are live, for example:

```
[notify] lead alerts: email -> youraddress@gmail.com
[notify] lead alerts: disabled (no SMTP_* or TWILIO_* env vars set)
```

Send a test through the site's contact form. If nothing arrives, check
`pm2 logs irur` for `[notify email]` or `[notify whatsapp]` lines — delivery
errors are logged there and never surfaced to the visitor.
