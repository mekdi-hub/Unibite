<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submission</title>
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
            background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .field {
            margin-bottom: 20px;
        }
        .label {
            font-weight: bold;
            color: #374151;
            display: block;
            margin-bottom: 5px;
        }
        .value {
            color: #1f2937;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border: 1px solid #e5e7eb;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍔 UniBite Contact Form</h1>
        <p>New message received</p>
    </div>
    
    <div class="content">
        <div class="field">
            <span class="label">Name:</span>
            <div class="value">{{ $data['name'] }}</div>
        </div>
        
        <div class="field">
            <span class="label">Email:</span>
            <div class="value">{{ $data['email'] }}</div>
        </div>
        
        @if(!empty($data['phone']))
        <div class="field">
            <span class="label">Phone:</span>
            <div class="value">{{ $data['phone'] }}</div>
        </div>
        @endif
        
        <div class="field">
            <span class="label">Subject:</span>
            <div class="value">{{ $data['subject'] }}</div>
        </div>
        
        <div class="field">
            <span class="label">Message:</span>
            <div class="value">{{ $data['message'] }}</div>
        </div>
    </div>
    
    <div class="footer">
        <p>This email was sent from the UniBite contact form.</p>
        <p>© {{ date('Y') }} UniBite. All rights reserved.</p>
    </div>
</body>
</html>
