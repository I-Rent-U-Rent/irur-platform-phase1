# Deploy IRUR on one Debian 13 Compute Engine VM

This setup runs the React/Express application, Nginx, and PostgreSQL on one
Debian 13 Compute Engine VM with a 40 GB boot disk. PostgreSQL listens only on
the VM loopback interface; it is not publicly exposed.

## 1. Create the VM

Run in Cloud Shell after replacing the project, region, and zone values.

```bash
export PROJECT_ID="your-gcp-project-id"
export ZONE="us-central1-a"
export VM="irur-web"
gcloud config set project "$PROJECT_ID"
gcloud services enable compute.googleapis.com

gcloud compute firewall-rules create allow-irur-web \
  --allow=tcp:80,tcp:443 --target-tags=irur-web

gcloud compute instances create "$VM" \
  --zone="$ZONE" --machine-type=e2-medium --boot-disk-size=40GB \
  --image-family=debian-13 --image-project=debian-cloud \
  --tags=irur-web

gcloud compute ssh "$VM" --zone="$ZONE"
```

## 2. Install PostgreSQL, Node.js, and Nginx

Run these commands on the VM:

```bash
sudo apt-get update
sudo apt-get install -y curl git nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo systemctl enable --now postgresql nginx
sudo useradd --system --create-home --shell /usr/sbin/nologin irur
sudo mkdir -p /opt/irur-platform /etc/irur
sudo chown -R irur:irur /opt/irur-platform
```

Create a dedicated local PostgreSQL database and user. Enter a strong password
when prompted; do not use the PostgreSQL superuser from the application.

```bash
read -s -p "IRUR database password: " DB_PASSWORD; echo
sudo -u postgres psql -v ON_ERROR_STOP=1 -v db_password="$DB_PASSWORD" \
  -c "CREATE USER irur_app WITH PASSWORD :'db_password';"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE irur OWNER irur_app;"
```

## 3. Install and start the application

Clone the repository on the VM (or copy it using `gcloud compute scp`):

```bash
sudo -u irur git clone YOUR_REPOSITORY_URL /opt/irur-platform
cd /opt/irur-platform
sudo -u irur npm ci
sudo -u irur npm ci --prefix client
sudo -u irur npm ci --prefix server
sudo -u irur npm run build
```

Create the app environment file:

```bash
sudo tee /etc/irur/irur.env >/dev/null <<EOF
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=irur
DB_USER=irur_app
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$(openssl rand -hex 32)
EOF
sudo chown root:irur /etc/irur/irur.env
sudo chmod 640 /etc/irur/irur.env
```

Install the service and Nginx configuration included with this repository:

```bash
sudo cp /opt/irur-platform/deploy/gcp/irur.service /etc/systemd/system/
sudo cp /opt/irur-platform/deploy/gcp/nginx-irur.conf /etc/nginx/sites-available/irur
sudo ln -s /etc/nginx/sites-available/irur /etc/nginx/sites-enabled/irur
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl daemon-reload
sudo systemctl enable --now irur
sudo nginx -t && sudo systemctl reload nginx

curl http://127.0.0.1:3001/api/health
```

The first start creates the application tables and imports
`properties_cleaned.csv` into the local PostgreSQL database.

## 4. HTTPS and backups

Point your domain A record to the VM external IP, replace `server_name _;` in
`/etc/nginx/sites-available/irur` with your domain, then run:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example -d www.your-domain.example
```

Back up PostgreSQL regularly to a protected location such as Cloud Storage:

```bash
sudo -u postgres pg_dump -Fc irur > /var/backups/irur-$(date +%F).dump
```

## Updates

```bash
cd /opt/irur-platform
sudo -u irur git pull
sudo -u irur npm ci && sudo -u irur npm ci --prefix client && sudo -u irur npm ci --prefix server
sudo -u irur npm run build
sudo systemctl restart irur
```

This layout keeps all application and database data on this VM. Maintain the
backup routine before making production data changes.
