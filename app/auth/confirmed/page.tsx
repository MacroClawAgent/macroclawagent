export default function EmailConfirmedPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Email Confirmed - Jonno</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #1C1612;
            color: #E8E0D0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
          }
          .container {
            text-align: center;
            max-width: 420px;
          }
          .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 32px;
          }
          .logo-dot {
            width: 12px;
            height: 12px;
            border-radius: 6px;
            background-color: #F5C842;
          }
          .logo-text {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #E8E0D0;
          }
          .icon-wrap {
            width: 80px;
            height: 80px;
            border-radius: 24px;
            background: rgba(139, 158, 110, 0.12);
            border: 1px solid rgba(139, 158, 110, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 36px;
          }
          h1 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 12px;
            color: #E8E0D0;
          }
          .subtitle {
            font-size: 16px;
            color: rgba(232, 224, 208, 0.55);
            line-height: 1.5;
            margin-bottom: 32px;
          }
          .card {
            background: #252018;
            border: 1px solid rgba(245, 200, 66, 0.12);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .card p {
            font-size: 14px;
            color: rgba(232, 224, 208, 0.5);
            line-height: 1.6;
          }
          .card strong {
            color: #F5C842;
          }
          .footer {
            font-size: 12px;
            color: rgba(232, 224, 208, 0.3);
            margin-top: 24px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="logo">
            <div className="logo-dot" />
            <span className="logo-text">Jonno</span>
          </div>

          <div className="icon-wrap">✓</div>

          <h1>Email Confirmed</h1>
          <p className="subtitle">
            Your email has been verified successfully. You can now go back to the Jonno app to complete your profile setup.
          </p>

          <div className="card">
            <p>
              <strong>Next step:</strong> Open the Jonno app — it will automatically detect your confirmation and take you through the profile setup.
            </p>
          </div>

          <p className="footer">
            You can close this page now.
          </p>
        </div>
      </body>
    </html>
  );
}
