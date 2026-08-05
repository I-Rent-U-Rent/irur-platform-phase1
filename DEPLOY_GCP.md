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

## Deploy to Cloud Run

This section deploys the backend and frontend together using Cloud Run, with
Cloud SQL for Postgres and Cloud Storage for uploads.

### 1. Enable required APIs

```bash
export PROJECT_ID="your-gcp-project-id"
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com storage.googleapis.com
```

### 2. Create Cloud SQL Postgres

```bash
gcloud sql instances create irur-postgres \
  --database-version=POSTGRES_15 \
  --cpu=1 --memory=4GB \
  --region=us-central1 \
  --storage-size=20GB

gcloud sql users set-password postgres --instance=irur-postgres --password="YOUR_DB_PASSWORD"
gcloud sql databases create irur --instance=irur-postgres
```

### 3. Create Cloud Storage bucket for uploads

```bash
export BUCKET_NAME="irur-uploads-$PROJECT_ID"
gsutil mb -l us-central1 gs://$BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

### 4. Build and deploy

Make sure your repo has the new `Dockerfile`, `.dockerignore`, and `cloudbuild.yaml`.

```bash
cd /path/to/irur-platform-phase1
npm install
npm install --prefix server
npm install --prefix client
npm run build
```

Deploy using Cloud Build and Cloud Run:

```bash
gcloud builds submit --config=cloudbuild.yaml .
```

Then deploy the Cloud Run service:

```bash
export INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe irur-postgres --format='value(connectionName)')
gcloud run deploy irur-phase1 \
  --image gcr.io/$PROJECT_ID/irur-phase1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --set-env-vars "NODE_ENV=production,PORT=8080,DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME,DB_USER=postgres,DB_PASSWORD=YOUR_DB_PASSWORD,DB_NAME=irur,GCS_BUCKET=$BUCKET_NAME,JWT_SECRET=$(openssl rand -hex 32)"
```

### 5. Verify

```bash
gcloud run services describe irur-phase1 --region=us-central1 --format='value(status.url)'
curl $(gcloud run services describe irur-phase1 --region=us-central1 --format='value(status.url)')/api/health
```

### 6. Notes

- `GCS_BUCKET` must match the bucket name you created.
- Cloud Run uses an ephemeral filesystem, so only the GCS path persists.
- If you need private bucket uploads, remove `allUsers:objectViewer` and use signed URLs.

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
