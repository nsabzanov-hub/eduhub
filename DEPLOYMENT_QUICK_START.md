# Quick Start: Make EduHub Public in 15 Minutes

This is a condensed version. For detailed explanations, see `DEPLOYMENT_GUIDE.md`.

## Prerequisites
- GitHub account
- 15 minutes

---

## Step 1: Push Code to GitHub (5 min)

```bash
# In your eduhub folder
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/eduhub.git
git push -u origin main
```

---

## Step 2: Set Up Database (5 min)

1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create new project → Wait 2 minutes
3. Settings → Database → Copy connection string
4. Replace `[YOUR-PASSWORD]` with your database password

---

## Step 3: Deploy to Vercel (5 min)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Import your `eduhub` repository
3. Add environment variables:
   - `DATABASE_URL` = Your Supabase connection string
   - `JWT_SECRET` = Random string (use [randomkeygen.com](https://randomkeygen.com))
   - `EMAIL_HOST` = `smtp.gmail.com`
   - `EMAIL_PORT` = `587`
   - `EMAIL_USER` = Your email
   - `EMAIL_PASS` = Your email app password
4. Click **Deploy**
5. Wait 3 minutes

---

## Step 4: Set Up Database Tables (2 min)

In your local terminal:

```bash
# Set database URL (replace with your Supabase URL)
export DATABASE_URL="your-supabase-connection-string"

# Create tables
npx prisma db push

# Seed initial data (optional)
npm run db:seed
```

---

## Step 5: Test (1 min)

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Login with:
   - Email: `admin@school.com`
   - Password: `admin123`

**Done!** 🎉

---

## Troubleshooting

**Build fails?** Check Vercel logs, ensure all env variables are set.

**Can't login?** Run the seed script to create users.

**Database error?** Verify DATABASE_URL is correct in Vercel.

---

For detailed help, see `DEPLOYMENT_GUIDE.md`

