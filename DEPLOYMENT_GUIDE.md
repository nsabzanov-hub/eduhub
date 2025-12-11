# How to Make EduHub Public - Complete Step-by-Step Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Prepare Your Code](#step-1-prepare-your-code)
4. [Step 2: Set Up a Cloud Database](#step-2-set-up-a-cloud-database)
5. [Step 3: Deploy to Vercel (Recommended)](#step-3-deploy-to-vercel-recommended)
6. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
7. [Step 5: Run Database Migrations](#step-5-run-database-migrations)
8. [Step 6: Test Your Live Site](#step-6-test-your-live-site)
9. [Step 7: Set Up a Custom Domain (Optional)](#step-7-set-up-a-custom-domain-optional)
10. [Alternative: Deploy to Other Platforms](#alternative-deploy-to-other-platforms)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will walk you through making your EduHub website accessible to the public on the internet. We'll use:
- **Vercel** for hosting (free, perfect for Next.js)
- **Supabase** or **Railway** for database (free tier available)
- **GitHub** to store your code (free)

**Total Cost**: $0 (using free tiers)

**Time Required**: 30-60 minutes

---

## Prerequisites

Before starting, make sure you have:
1. ✅ A GitHub account (free) - [Sign up here](https://github.com)
2. ✅ A Vercel account (free) - We'll create this during setup
3. ✅ Git installed on your computer - [Download here](https://git-scm.com/downloads)
4. ✅ Your EduHub code ready

---

## Step 1: Prepare Your Code

### 1.1 Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `eduhub` (or any name you like)
   - **Description**: "K-12 School Communication Platform"
   - **Visibility**: Choose **Private** (you can make it public later)
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

### 1.2 Push Your Code to GitHub

Open your terminal/command prompt in the `eduhub` folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: EduHub platform"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/eduhub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**What this does**: Uploads your code to GitHub so Vercel can access it.

**Troubleshooting**: 
- If asked for username/password, use a GitHub Personal Access Token instead
- Create one: GitHub → Settings → Developer settings → Personal access tokens → Generate new token

---

## Step 2: Set Up a Cloud Database

Your website needs a database that's accessible from the internet. We'll use **Supabase** (free and easy).

### 2.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub (easiest option)
4. Click **"New Project"**

### 2.2 Create a New Project

1. Fill in:
   - **Name**: `eduhub` (or any name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
2. Click **"Create new project"**
3. Wait 2-3 minutes for setup to complete

### 2.3 Get Your Database Connection String

1. In your Supabase project, click **"Settings"** (gear icon) in the left sidebar
2. Click **"Database"** in the settings menu
3. Scroll to **"Connection string"**
4. Under **"URI"**, copy the connection string
5. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
6. Replace `[YOUR-PASSWORD]` with the password you created
7. **Save this string** - you'll need it later!

**Example**:
```
postgresql://postgres:MyPassword123@db.abcdefgh.supabase.co:5432/postgres
```

---

## Step 3: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps. It's free and automatic.

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign up"**
3. Choose **"Continue with GitHub"** (easiest)
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `eduhub` repository
3. Click **"Import"**

### 3.3 Configure Project Settings

Vercel will auto-detect Next.js settings. Just verify:

- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

**DO NOT click "Deploy" yet!** We need to add environment variables first.

---

## Step 4: Configure Environment Variables

Environment variables store sensitive information like database passwords.

### 4.1 Add Environment Variables in Vercel

1. In the Vercel project setup page, scroll to **"Environment Variables"**
2. Click **"Add"** for each variable below:

#### Add These Variables:

**1. DATABASE_URL**
- **Name**: `DATABASE_URL`
- **Value**: Paste your Supabase connection string from Step 2.3
- **Environment**: Select all (Production, Preview, Development)

**2. JWT_SECRET**
- **Name**: `JWT_SECRET`
- **Value**: Generate a random string (use [this generator](https://randomkeygen.com/) - use "CodeIgniter Encryption Keys")
- **Environment**: Select all

**3. EMAIL_HOST** (Optional but recommended)
- **Name**: `EMAIL_HOST`
- **Value**: `smtp.gmail.com` (or your email provider)
- **Environment**: Select all

**4. EMAIL_PORT**
- **Name**: `EMAIL_PORT`
- **Value**: `587`
- **Environment**: Select all

**5. EMAIL_USER**
- **Name**: `EMAIL_USER`
- **Value**: Your email address (e.g., `yourname@gmail.com`)
- **Environment**: Select all

**6. EMAIL_PASS**
- **Name**: `EMAIL_PASS`
- **Value**: Your email app password (see note below)
- **Environment**: Select all

**Note on Email Password**: 
- For Gmail: Enable 2FA, then create an "App Password"
- Go to: Google Account → Security → 2-Step Verification → App passwords
- Generate password for "Mail" and use that here

### 4.2 Deploy!

1. After adding all environment variables, scroll down
2. Click **"Deploy"**
3. Wait 2-5 minutes for deployment
4. You'll see a progress bar

**What happens**: Vercel builds your app and makes it live!

---

## Step 5: Run Database Migrations

Your database is empty. We need to create the tables.

### 5.1 Option A: Use Supabase SQL Editor (Easiest)

1. Go back to your Supabase project
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. We'll generate the SQL from Prisma schema

### 5.2 Generate Prisma Migration SQL

In your local terminal (in the eduhub folder):

```bash
# Generate migration SQL
npx prisma migrate dev --create-only --name init
```

This creates a migration file. But we'll use a simpler approach:

### 5.3 Push Schema Directly (Recommended)

1. In your local terminal, set your DATABASE_URL:
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="your-supabase-connection-string-here"
   
   # Windows CMD
   set DATABASE_URL=your-supabase-connection-string-here
   
   # Mac/Linux
   export DATABASE_URL="your-supabase-connection-string-here"
   ```

2. Push the schema:
   ```bash
   npx prisma db push
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

**What this does**: Creates all tables in your Supabase database.

### 5.4 Verify Tables Were Created

1. In Supabase, click **"Table Editor"** in left sidebar
2. You should see tables like: `User`, `Class`, `Assignment`, etc.
3. If you see them, success! ✅

---

## Step 6: Test Your Live Site

### 6.1 Visit Your Live URL

1. After Vercel deployment completes, you'll see:
   - **"Congratulations!"** message
   - A URL like: `https://eduhub-xxxxx.vercel.app`
2. Click the URL or copy it
3. Your site should load!

### 6.2 Create Your First User

Your database is empty, so you need to create users. You have two options:

#### Option A: Use Supabase Dashboard (Quick Test)

1. Go to Supabase → Table Editor → `User` table
2. Click **"Insert row"**
3. Fill in:
   - `email`: `admin@school.com`
   - `passwordHash`: We need to hash a password first
   - `firstName`: `Admin`
   - `lastName`: `User`
   - `role`: `ADMIN`

**To hash password**, use this in your local terminal:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10))"
```

Copy the output and use it as `passwordHash`.

#### Option B: Create a Seed Script (Better)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      passwordHash: await bcrypt.hash('password123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      adminProfile: {
        create: {
          title: 'School Administrator',
        },
      },
    },
  })

  console.log('Created admin user:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Then run:
```bash
npx ts-node prisma/seed.ts
```

### 6.3 Test Login

1. Go to your live site URL
2. Click "Sign In"
3. Try logging in with the user you created
4. If it works, you're live! 🎉

---

## Step 7: Set Up a Custom Domain (Optional)

By default, your site has a URL like `eduhub-xxxxx.vercel.app`. You can use your own domain.

### 7.1 Buy a Domain (if you don't have one)

Popular options:
- [Namecheap](https://www.namecheap.com) - ~$10/year
- [Google Domains](https://domains.google) - ~$12/year
- [Cloudflare](https://www.cloudflare.com/products/registrar) - At cost price

### 7.2 Add Domain to Vercel

1. In Vercel project, go to **"Settings"** → **"Domains"**
2. Enter your domain (e.g., `eduhub.com`)
3. Click **"Add"**
4. Follow Vercel's instructions to update DNS records

### 7.3 Update DNS Records

Vercel will show you what DNS records to add. Usually:
- **Type**: `CNAME`
- **Name**: `@` or `www`
- **Value**: `cname.vercel-dns.com`

Add these in your domain registrar's DNS settings.

**Wait 24-48 hours** for DNS to propagate.

---

## Alternative: Deploy to Other Platforms

### Railway (Alternative to Vercel)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `eduhub` repository
5. Add environment variables
6. Railway will auto-detect Next.js and deploy

**Pros**: Also provides database hosting
**Cons**: Free tier is more limited

### Render (Alternative to Vercel)

1. Go to [render.com](https://render.com)
2. Sign up
3. Click **"New"** → **"Web Service"**
4. Connect GitHub repo
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables
7. Deploy

**Pros**: Free tier available
**Cons**: Slower cold starts on free tier

### Self-Hosted (Advanced)

If you have a VPS (Virtual Private Server):

1. Install Node.js, PostgreSQL
2. Clone your repo
3. Set environment variables
4. Run `npm install && npm run build && npm start`
5. Use PM2 or systemd to keep it running

**Not recommended for beginners**

---

## Troubleshooting

### Problem: "Database connection failed"

**Solution**:
1. Check your `DATABASE_URL` in Vercel environment variables
2. Make sure password in connection string matches Supabase password
3. Check Supabase project is active (not paused)

### Problem: "Build failed" in Vercel

**Solution**:
1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies
3. Fix errors and redeploy

### Problem: "Cannot find module" error

**Solution**:
1. Make sure `package.json` has all dependencies
2. Run `npm install` locally to verify
3. Commit `package-lock.json` to GitHub

### Problem: Site loads but shows errors

**Solution**:
1. Check browser console (F12) for errors
2. Check Vercel function logs
3. Verify database tables exist (Step 5)
4. Verify environment variables are set

### Problem: Can't login / Authentication not working

**Solution**:
1. Verify `JWT_SECRET` is set in environment variables
2. Check that users exist in database
3. Verify password hashing is working
4. Check Vercel function logs for errors

### Problem: Email not sending

**Solution**:
1. Verify email environment variables are set
2. For Gmail, use App Password (not regular password)
3. Check email provider allows SMTP from Vercel
4. Check Vercel function logs

---

## Security Checklist

Before going fully public, ensure:

- [ ] All environment variables are set (never commit `.env` to GitHub)
- [ ] `JWT_SECRET` is a strong random string
- [ ] Database password is strong
- [ ] Email password is an app-specific password
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Remove any test/admin accounts with weak passwords
- [ ] Review and test all authentication flows

---

## Next Steps After Deployment

1. **Create initial data**:
   - Create admin user
   - Create school record
   - Create academic year
   - Create classes
   - Add students and teachers

2. **Set up monitoring**:
   - Enable Vercel Analytics (free)
   - Set up error tracking (Sentry free tier)

3. **Configure backups**:
   - Supabase has automatic backups
   - Consider exporting data regularly

4. **Test all features**:
   - Login/logout
   - Create assignments
   - Take attendance
   - Send messages
   - View gradebook

---

## Summary

You've now:
1. ✅ Put your code on GitHub
2. ✅ Set up a cloud database (Supabase)
3. ✅ Deployed to Vercel
4. ✅ Configured environment variables
5. ✅ Created database tables
6. ✅ Made your site live on the internet!

Your EduHub platform is now accessible at: `https://your-project.vercel.app`

**Congratulations!** 🎉

---

## Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)

---

## Quick Reference: Important URLs

After deployment, bookmark these:

- **Your Live Site**: `https://your-project.vercel.app`
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/eduhub`

---

**Remember**: Keep your passwords and secrets safe! Never commit them to GitHub.

