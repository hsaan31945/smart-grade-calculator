# Smart Grade Calculator

A full-stack university-specific relative grade, GPA and CGPA platform by Vireonix. Shared data is modeled around exact **Subject Offerings**, so each program + semester + subject + section + teacher + academic term owns its own assessment components, class statistics and relative grade policy.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, MongoDB, Prisma ORM, Auth.js credentials auth, bcrypt, Zod, React Hook Form-ready validation, and Recharts.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set a MongoDB Atlas connection string and auth secret:

   ```env
   DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/smart_grade?retryWrites=true&w=majority"
   AUTH_SECRET="generate-with-openssl-rand-base64-32"
   AUTH_TRUST_HOST=true
   APP_URL="http://localhost:3000"
   RESEND_API_KEY="re_your_api_key"
   RESEND_FROM_EMAIL="Smart Grade Calculator <onboarding@resend.dev>"
   ```

3. Create MongoDB collections and indexes, then generate the Prisma client:

   ```bash
   npm run db:push
   npm run db:generate
   ```

4. Seed sample university data:

   ```bash
   npm run db:seed
   ```

5. Start development:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## MongoDB Atlas and Vercel

1. Create an Atlas database user and copy the application connection string.
2. Replace its password and database name; URL-encode special characters in the password.
3. In Atlas Network Access, permit Vercel connections. `0.0.0.0/0` is the simplest serverless option; use strong database credentials because this permits connections from any IP.
4. Add `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_TRUST_HOST=true` in Vercel project environment variables.
5. Run `DATABASE_URL="your-atlas-url" npm run db:push` and then `DATABASE_URL="your-atlas-url" npm run db:seed` once from a trusted machine.

MongoDB does not use Prisma SQL migrations. Schema synchronization is handled by `prisma db push` and indexes declared in `schema.prisma`.

## Password reset email

The login page links to `/forgot-password`. Reset requests store only a SHA-256 token hash, expire after 30 minutes, are single-use, and return the same response whether an account exists or not.

1. Create a Resend API key and set `RESEND_API_KEY` in Vercel.
2. Set `APP_URL` to the production URL, for example `https://your-project.vercel.app`.
3. For initial testing, use `Smart Grade Calculator <onboarding@resend.dev>` as `RESEND_FROM_EMAIL`. Resend testing restrictions may limit recipients.
4. For real student emails, verify your own sending domain in Resend and use an address such as `Smart Grade Calculator <support@yourdomain.com>`.
5. After pulling this update, run `npm run db:push` once to create the password-reset collection and indexes.

## Seed credentials

- Admin: `admin@vireonix.com` / `admin12345`
- Student: `student@test.com` / `student12345`

## Important behavior

- Students enter only obtained marks. Class average, standard deviation, components, weightages and grade policy load from the published offering.
- Final grade is relative: `z = (student percentage - class average) / standard deviation`.
- Publishing is blocked unless an offering totals exactly 100% weightage and has a non-zero standard deviation.
- All server mutations independently check role, and student result/GPA mutations enforce ownership.
- CSV import is a clearly labeled backend-ready placeholder, as permitted by the specification.
