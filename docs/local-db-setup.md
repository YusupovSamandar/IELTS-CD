# 🗄️ IELTS Trek Database Management

Complete guide for managing database configurations in IELTS Trek.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```powershell
# Setup local database with Docker
bun run db:setup

# Setup with PgAdmin included
bun run db:setup:pgadmin
```

### Option 2: Manual Setup

1. **Copy environment file:**

   ```powershell
   cp .env.local.example .env.local
   ```

2. **Start database:**

   ```powershell
   bun run db:up
   ```

3. **Run migrations:**
   ```powershell
   bun run db:migrate:deploy
   ```

## 🔄 Database Provider Switching

### Switch to Local Database

```powershell
bun run db:switch:local
```

### Switch to Supabase

```powershell
bun run db:switch:supabase
```

### Manual Switching

```powershell
# Copy the appropriate config
cp .env.local.example .env.local      # For local
cp .env.supabase.example .env.local   # For Supabase

# Update DATABASE_PROVIDER in .env.local
DATABASE_PROVIDER=local               # or 'supabase'
```

## 📋 Available Scripts

| Script                       | Description                   |
| ---------------------------- | ----------------------------- |
| `bun run db:setup`           | Complete local database setup |
| `bun run db:setup:pgadmin`   | Setup with PgAdmin            |
| `bun run db:switch:local`    | Switch to local database      |
| `bun run db:switch:supabase` | Switch to Supabase            |
| `bun run db:up`              | Start Docker containers       |
| `bun run db:down`            | Stop Docker containers        |
| `bun run db:logs`            | View database logs            |
| `bun run db:studio`          | Open Prisma Studio            |
| `bun run db:migrate`         | Create new migration          |
| `bun run db:migrate:deploy`  | Deploy migrations             |
| `bun run db:reset`           | Reset database                |
| `bun run db:validate`        | Validate schema               |

## 🐳 Docker Configuration

### Services Included

1. **PostgreSQL 15**

   - Port: `5433` (to avoid conflicts with other PostgreSQL instances)
   - Database: `ieltstrek`
   - User: `ieltstrek_user`
   - Password: `ieltstrek_local_password`

2. **PgAdmin (Optional)**
   - Port: `5050`
   - Email: `admin@ieltstrek.local`
   - Password: `admin123`

### Docker Commands

```powershell
# Start all services
docker-compose up -d

# Start with PgAdmin
docker-compose --profile tools up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset everything
docker-compose down -v
```

## ⚙️ Environment Configuration

### Local Development (.env.local)

```bash
DATABASE_PROVIDER=local
LOCAL_DATABASE_URL="postgresql://ieltstrek_user:ieltstrek_local_password@localhost:5433/ieltstrek"
LOCAL_DIRECT_URL="postgresql://ieltstrek_user:ieltstrek_local_password@localhost:5433/ieltstrek"
```

### Supabase Configuration (.env.local)

```bash
DATABASE_PROVIDER=supabase
SUPABASE_DATABASE_URL="your-supabase-connection-pooler-url"
SUPABASE_DIRECT_URL="your-supabase-direct-url"
```

## 🎯 Database Access

### Local Database Access

**Connection String:**

```
postgresql://ieltstrek_user:ieltstrek_local_password@localhost:5433/ieltstrek
```

**Tools:**

- **Prisma Studio:** `bun run db:studio` → http://localhost:5555
- **PgAdmin:** http://localhost:5050 (if started with `--profile tools`)
- **psql:** `docker-compose exec postgres psql -U ieltstrek_user -d ieltstrek`

### Supabase Database Access

**Tools:**

- **Supabase Dashboard:** Your project dashboard
- **Prisma Studio:** `bun run db:studio`

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed

```powershell
# Check if Docker is running
docker --version

# Check container status
docker-compose ps

# Restart database
docker-compose restart postgres
```

#### Port Already in Use

```powershell
# Check what's using port 5433
netstat -ano | findstr :5433

# If needed, you can change the port in docker-compose.yml
# ports:
#   - "5434:5432"  # Change 5433 to 5434 or any other available port
```

#### Migration Issues

```powershell
# Reset migrations (WARNING: destroys data)
bun run db:reset

# Apply specific migration
bun prisma migrate deploy
```

#### Permission Issues

```powershell
# Fix database permissions
docker-compose exec postgres psql -U postgres -c "
  GRANT ALL PRIVILEGES ON DATABASE ieltstrek TO ieltstrek_user;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ieltstrek_user;
"
```

### Database Status Check

Add the Database Dashboard component to any admin page:

```tsx
import { DatabaseDashboard } from '@/components/database/database-dashboard';

export default function AdminPage() {
  return (
    <div>
      <DatabaseDashboard />
    </div>
  );
}
```

## 📊 Monitoring & Maintenance

### Health Checks

```powershell
# Test database connection
bun prisma db pull --print

# Validate schema
bun run db:validate

# Check migrations status
bun prisma migrate status
```

### Backup & Restore

```powershell
# Create backup
docker-compose exec postgres pg_dump -U ieltstrek_user ieltstrek > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U ieltstrek_user ieltstrek < backup.sql
```

### Performance Monitoring

```powershell
# View active connections
docker-compose exec postgres psql -U ieltstrek_user -d ieltstrek -c "
  SELECT count(*) as active_connections
  FROM pg_stat_activity
  WHERE state = 'active';
"

# Database size
docker-compose exec postgres psql -U ieltstrek_user -d ieltstrek -c "
  SELECT pg_size_pretty(pg_database_size('ieltstrek')) as database_size;
"
```

## 🚀 Production Deployment

### Environment Variables

Set these in your production environment:

```bash
DATABASE_PROVIDER=production
PRODUCTION_DATABASE_URL="your-production-database-url"
PRODUCTION_DIRECT_URL="your-production-direct-url"
```

### Migration Deployment

```powershell
# Deploy to production
DATABASE_PROVIDER=production bun prisma migrate deploy
```

## 🎉 Success!

You now have a fully configured database system with:

✅ **Docker PostgreSQL** for local development  
✅ **Supabase integration** for cloud development  
✅ **Easy switching** between providers  
✅ **Automated setup scripts**  
✅ **Database monitoring dashboard**  
✅ **Comprehensive tooling**

**Next Steps:**

1. Run `bun run db:setup` to get started
2. Use `bun dev` to start your application
3. Access database tools as needed
