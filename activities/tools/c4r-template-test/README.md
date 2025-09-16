C4R Activity Template

Overview
- This is a template for creating a C4R activity.
- It is built with Next.js and MongoDB.
- It is designed to be used with Vercel.

Fonts
- Stored in Public folder
- Setup to use GeneralSans-Semibold font
- Has GeneralSans-Regular font if needed 

Database
- MongoDB installed
- Includes our standard folder structure for database operations
    - API /Libs / mongodb.js - includes mongoose library
    - API / Models / exampleModel.js - example database model schema
    - API / ExampleAPI / route.js - example of basic API implementation using exampleModel

See API folder for example of database functionality


Note on reading URL parameters
- Vercel requires all components/pages to be wrapped in a suspense boundary when reading URL parameters.
- Non-compliant code will run locally but fail when deployed to Vercel.
- See ExamplePage / page.js for an example of how to wrap a component/page in a suspense boundary.




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
