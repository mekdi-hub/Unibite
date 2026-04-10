<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restaurant Approved</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .restaurant-name {
            color: #f97316;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
        }
        .info-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e5e7eb;
            border-top: none;
            color: #6b7280;
            font-size: 14px;
        }
        .credentials {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .credentials p {
            margin: 5px 0;
        }
        .credentials strong {
            color: #f97316;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🚴‍♀️ UniBite</div>
        <p style="margin: 0; font-size: 16px;">Campus Food Delivery</p>
    </div>

    <div class="content">
        <h2 style="color: #16a34a; margin-top: 0;">✅ Congratulations! Your Restaurant Has Been Approved</h2>
        
        <p>Hello <strong>{{ $user->name }}</strong>,</p>
        
        <p>Great news! Your restaurant has been approved on the <strong>UniBite Delivery Platform</strong>.</p>
        
        <div class="restaurant-name">
            🏪 {{ $restaurant->restaurant_name }}
        </div>

        <p>You can now start receiving orders from students on campus!</p>

        <div class="info-box">
            <strong>📋 Next Steps:</strong>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Log in to your restaurant dashboard</li>
                <li>Add your menu items</li>
                <li>Set your availability hours</li>
                <li>Start receiving orders!</li>
            </ol>
        </div>

        <div class="credentials">
            <p><strong>Your Login Credentials:</strong></p>
            <p>📧 Email: <strong>{{ $user->email }}</strong></p>
            <p>🔑 Password: <strong>The password you set during registration</strong></p>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/login" class="button">
                🚀 Login to Dashboard
            </a>
        </div>

        <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

        <p>Welcome to the UniBite family!</p>
        
        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The UniBite Team</strong>
        </p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} UniBite - Campus Food Delivery Platform</p>
        <p>This is an automated email. Please do not reply to this message.</p>
    </div>
</body>
</html>
