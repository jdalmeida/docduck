const issuerUrl = process.env.VITE_CLERK_ISSUER_URL;

if (!issuerUrl) {
  throw new Error(
    "VITE_CLERK_ISSUER_URL environment variable not set! Go to https://dashboard.clerk.com -> Your application -> JWT Templates -> Convex and copy the Issuer URL."
  );
}

export default {
  providers: [
    {
      domain: issuerUrl,
      applicationID: "convex",
    },
  ],
}; 