"use client"

/**
 * Replaces the root layout when it crashes, so it must render its own
 * document and cannot depend on global styles or theme classes.
 */
export default function GlobalError({
  error,
  retry,
}: Readonly<{
  error: Error & { digest?: string }
  retry: () => void
}>) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong · WedPlan</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f6",
          color: "#161912",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "24px",
        }}
      >
        <main
          role="alert"
          style={{
            width: "100%",
            maxWidth: "32rem",
            borderRadius: "16px",
            border: "1px solid #c5cbbf",
            background: "#ffffff",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(22, 25, 18, 0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#7a6341",
              textTransform: "uppercase",
            }}
          >
            WedPlan
          </p>
          <h1
            style={{
              margin: "16px 0 8px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "30px",
              fontWeight: 500,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: "0 auto",
              maxWidth: "26rem",
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#555b50",
            }}
          >
            We could not display this page. Please try again — the rest of
            WedPlan is still here when you need it.
          </p>
          {error.digest ? (
            <p style={{ marginTop: "12px", fontSize: "11px", color: "#777" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "24px",
              width: "100%",
              border: 0,
              borderRadius: "8px",
              background: "#444b39",
              color: "#ffffff",
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
