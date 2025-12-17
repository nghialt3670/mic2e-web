// Check critical environment variables on startup
export function checkEnvironmentVariables() {
  const requiredEnvVars = [
    "AUTH_SECRET",
    "AUTH_GOOGLE_ID", 
    "AUTH_GOOGLE_SECRET",
    "DATABASE_URL",
  ];

  const missing: string[] = [];
  const present: string[] = [];

  console.log("\n=== Environment Variables Check ===");
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value === "") {
      missing.push(envVar);
      console.error(`❌ ${envVar}: NOT SET`);
    } else {
      present.push(envVar);
      // Mask the value for security
      const masked = value.substring(0, 4) + "..." + value.substring(value.length - 4);
      console.log(`✓ ${envVar}: ${masked}`);
    }
  }

  // Check optional env vars
  const optionalEnvVars = [
    "AUTH_URL",
    "AUTH_TRUST_HOST",
    "NEXT_PUBLIC_BASE_PATH",
  ];

  console.log("\nOptional variables:");
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`  ✓ ${envVar}: ${value}`);
    } else {
      console.log(`  - ${envVar}: not set`);
    }
  }

  console.log("=================================\n");

  if (missing.length > 0) {
    console.error(`\n⚠️  WARNING: Missing required environment variables:`);
    console.error(`   ${missing.join(", ")}`);
    console.error(`   Authentication will fail!\n`);
  } else {
    console.log("✓ All required environment variables are set\n");
  }

  return {
    allPresent: missing.length === 0,
    missing,
    present,
  };
}
