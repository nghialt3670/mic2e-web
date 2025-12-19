export default function DebugEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Environment Variables (Build Time)
      </h1>
      <div className="space-y-2 font-mono text-sm">
        <div>
          <strong>NEXT_PUBLIC_BASE_PATH:</strong>{" "}
          <code className="bg-muted px-2 py-1 rounded">
            {process.env.NEXT_PUBLIC_BASE_PATH || "(not set)"}
          </code>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm">
          <strong>Note:</strong> NEXT_PUBLIC_ variables are embedded at build
          time. If you changed them, rebuild:{" "}
          <code>docker-compose up -d --build web</code>
        </p>
      </div>
    </div>
  );
}
