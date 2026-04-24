<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - UniBite</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 5px 0 0 0;
            font-size: 14px;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1f2937;
            font-size: 24px;
            margin: 0 0 20px 0;
        }
        .content p {
            color: #4b5563;
            margin: 0 0 20px 0;
            font-size: 16px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
        }
        .button:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }
        .info-box {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 0;
            color: #991b1b;
            font-size: 14px;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
        }
        .link {
            color: #ef4444;
            text-decoration: none;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚴‍♀️</div>
            <h1>UniBite</h1>
            <p>Delivery to your campus</p>
        </div>
        
        <div class="content">
            <h2>Reset Your Password</h2>
            
            <p>Hello!</p>
            
            <p>You are receiving this email because we received a password reset request for your account.</p>
            
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="button">Reset Password</a>
            </div>
            
            <div class="info-box">
                <p><strong>⏰ This password reset link will expire in 60 minutes.</strong></p>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
            
            <p><a href="{{ $resetUrl }}" class="link">{{ $resetUrl }}</a></p>
            
            <p>If you did not request a password reset, no further action is required. Your password will remain unchanged.</p>
        </div>
        
        <div class="footer">
            <p><strong>UniBite - Food Delivery Service</strong></p>
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; {{ date('Y') }} UniBite. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
