# Deployment Guide for 1Cent Dashboard

This guide will help you deploy your 1Cent dashboard to `dashboard.1cent.app` using Vercel.

## Prerequisites

1. **GitHub Account**: You'll need a GitHub account to host your code
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Domain**: You'll need access to manage DNS for `1cent.app`

## Step 1: Prepare Your Code

1. **Create a new GitHub repository**
   ```bash
   # Create a new directory for your dashboard
   mkdir onecent-dashboard
   cd onecent-dashboard
   
   # Initialize git
   git init
   git add .
   git commit -m "Initial dashboard commit"
   
   # Create a new repository on GitHub and push
   git remote add origin https://github.com/yourusername/onecent-dashboard.git
   git push -u origin main
   ```

2. **Verify your project structure**
   ```
   onecent-dashboard/
   ├── app/
   │   ├── globals.css
   │   ├── layout.tsx
   │   ├── page.tsx
   │   ├── users/
   │   │   └── page.tsx
   │   └── products/
   │       └── page.tsx
   ├── components/
   │   └── Navigation.tsx
   ├── lib/
   │   └── supabase.ts
   ├── package.json
   ├── next.config.js
   ├── tailwind.config.js
   ├── tsconfig.json
   ├── vercel.json
   └── README.md
   ```

## Step 2: Deploy to Vercel

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `onecent-dashboard` repository

2. **Configure Environment Variables**
   In the Vercel project settings, add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://htvtuvkluespcjxfyplm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnR1dmtsdWVzcGNqeGZ5cGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODIwMjEsImV4cCI6MjA2MzM1ODAyMX0.Zyf8nyr40Te6V-iTL2wox9reyvBidw2WRUiW5ApjB0g
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your dashboard will be available at a Vercel URL (e.g., `https://onecent-dashboard.vercel.app`)

## Step 3: Configure Custom Domain

1. **Add Custom Domain in Vercel**
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add `dashboard.1cent.app`
   - Vercel will provide DNS configuration instructions

2. **Configure DNS**
   You'll need to add these DNS records to your domain provider:

   **For Cloudflare:**
   ```
   Type: CNAME
   Name: dashboard
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud)
   ```

   **For other providers:**
   ```
   Type: CNAME
   Name: dashboard
   Value: cname.vercel-dns.com
   ```

3. **Verify Domain**
   - Wait for DNS propagation (can take up to 24 hours)
   - Vercel will automatically provision SSL certificates
   - Your dashboard will be available at `https://dashboard.1cent.app`

## Step 4: Security Configuration

1. **Enable HTTPS**
   - Vercel automatically provides SSL certificates
   - Ensure all traffic is redirected to HTTPS

2. **Set Security Headers**
   The `vercel.json` file already includes security headers:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: origin-when-cross-origin

3. **Environment Variables**
   - Keep your Supabase keys secure
   - Never commit sensitive data to your repository
   - Use Vercel's environment variable system

## Step 5: Monitoring and Analytics

1. **Vercel Analytics**
   - Enable Vercel Analytics in your project settings
   - Monitor performance and user behavior

2. **Error Tracking**
   - Consider adding Sentry for error tracking
   - Monitor application errors and performance

3. **Uptime Monitoring**
   - Set up uptime monitoring with services like UptimeRobot
   - Get notified of any downtime

## Step 6: Continuous Deployment

1. **Automatic Deployments**
   - Vercel automatically deploys when you push to main branch
   - Set up branch protection rules in GitHub

2. **Preview Deployments**
   - Create feature branches for testing
   - Vercel creates preview deployments for each PR

3. **Rollback Strategy**
   - Vercel keeps deployment history
   - You can rollback to previous deployments if needed

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript configuration
   - Check for syntax errors

2. **Environment Variables**
   - Ensure all required env vars are set in Vercel
   - Check that variable names match your code

3. **Domain Issues**
   - Verify DNS configuration
   - Check domain propagation with tools like `dig`
   - Ensure SSL certificate is provisioned

4. **Performance Issues**
   - Optimize images and assets
   - Use Next.js image optimization
   - Consider CDN for static assets

### Support

If you encounter issues:

1. **Check Vercel Logs**
   - Go to your project in Vercel dashboard
   - Check "Functions" tab for serverless function logs
   - Check "Deployments" for build logs

2. **Debug Locally**
   ```bash
   npm run dev
   # Test locally before deploying
   ```

3. **Contact Support**
   - Vercel support: [vercel.com/support](https://vercel.com/support)
   - GitHub issues for code problems

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm update
   # Test locally, then deploy
   ```

2. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor Supabase usage
   - Review error logs

3. **Backup Data**
   - Export important data regularly
   - Keep backups of environment variables
   - Document configuration changes

### Scaling Considerations

1. **Traffic Management**
   - Vercel automatically scales
   - Monitor bandwidth usage
   - Consider edge functions for global performance

2. **Database Optimization**
   - Monitor Supabase query performance
   - Optimize database indexes
   - Consider read replicas for high traffic

## Cost Optimization

1. **Vercel Pricing**
   - Hobby plan: Free for personal projects
   - Pro plan: $20/month for teams
   - Enterprise: Custom pricing

2. **Supabase Pricing**
   - Free tier: 500MB database, 2GB bandwidth
   - Pro plan: $25/month for more resources

3. **Domain Costs**
   - Domain registration: ~$10-15/year
   - SSL certificates: Free with Vercel

## Security Best Practices

1. **Access Control**
   - Implement authentication for admin access
   - Use environment variables for secrets
   - Regular security audits

2. **Data Protection**
   - Encrypt sensitive data
   - Implement proper CORS policies
   - Regular backup procedures

3. **Monitoring**
   - Set up alerts for downtime
   - Monitor for suspicious activity
   - Regular security updates

---

Your dashboard is now ready at `https://dashboard.1cent.app`! 🎉

For ongoing support and updates, refer to the main README.md file. 