# 1Cent Dashboard

A comprehensive analytics and management dashboard for the 1Cent app, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 **Real-time Analytics**: Monitor user activity, product data, and store performance
- 👥 **User Management**: View and manage app users with detailed statistics
- 📦 **Product Management**: Track products across stores with pricing analytics
- 🏪 **Store Analytics**: Monitor store performance and user engagement
- 📈 **Interactive Charts**: Visualize data with beautiful charts and graphs
- 🔐 **Secure Authentication**: Protected admin access
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: Supabase
- **Deployment**: Vercel (recommended)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://htvtuvkluespcjxfyplm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnR1dmtsdWVzcGNqeGZ5cGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODIwMjEsImV4cCI6MjA2MzM1ODAyMX0.Zyf8nyr40Te6V-iTL2wox9reyvBidw2WRUiW5ApjB0g
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial dashboard commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Set up custom domain**
   - In Vercel dashboard, go to your project settings
   - Navigate to "Domains"
   - Add your custom domain: `dashboard.1cent.app`
   - Configure DNS settings as instructed

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://htvtuvkluespcjxfyplm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
dashboard/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard home
│   ├── users/             # Users management
│   └── products/          # Products management
├── lib/                   # Utility functions
│   └── supabase.ts        # Supabase client
├── components/            # Reusable components
├── public/               # Static assets
└── package.json          # Dependencies
```

## Dashboard Features

### Main Dashboard
- **Overview Statistics**: Users, products, stores, revenue
- **Recent Activity**: Real-time user actions
- **Quick Actions**: Common management tasks
- **Performance Metrics**: Key performance indicators

### User Management
- **User List**: Complete user database with search
- **User Analytics**: Registration trends, active users
- **User Details**: Individual user profiles and activity
- **User Actions**: Edit, delete, ban users

### Product Management
- **Product Catalog**: All products with images and details
- **Price Analytics**: Average prices, price trends
- **Store Distribution**: Products by store
- **Product Actions**: Add, edit, delete products

### Store Analytics
- **Store Performance**: Revenue, user engagement
- **Geographic Data**: Store locations and coverage
- **User Reviews**: Store ratings and feedback
- **Inventory Tracking**: Product availability

## API Integration

The dashboard connects to your Supabase backend and provides:

- **Real-time Data**: Live updates from your app
- **Secure Access**: Protected admin routes
- **Data Export**: CSV/JSON export capabilities
- **Analytics**: Advanced reporting and insights

## Customization

### Adding New Pages

1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. Follow the existing page structure
4. Add navigation links

### Styling

- Uses Tailwind CSS for consistent styling
- Custom color scheme in `tailwind.config.js`
- Responsive design patterns
- Dark mode support (coming soon)

### Data Sources

- **Supabase Tables**: Users, products, stores, shopping lists
- **Real-time Subscriptions**: Live data updates
- **Analytics**: Custom metrics and KPIs

## Security

- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Secure API access
- **Authentication**: Admin-only access (to be implemented)
- **Data Validation**: Input sanitization

## Performance

- **Static Generation**: Pre-rendered pages
- **Image Optimization**: Next.js image optimization
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Efficient data caching

## Support

For support and questions:

- **Documentation**: Check this README
- **Issues**: Create GitHub issues
- **Email**: support@1cent.com

## License

This project is proprietary software for 1Cent app.

---

**Built with ❤️ for 1Cent** 