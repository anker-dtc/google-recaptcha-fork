# google-recaptcha-multisite

Google reCAPTCHA (v2/v3) module for NestJS framework.

## Installation

```bash
npm install github:anker-dtc/google-recaptcha-multisite
```

## Quick Start

### Environment Variables

You can configure the module using environment variables:

```env
# Single site configuration (required if not using multi-site)
GOOGLE_RECAPTCHA_SECRET_KEY=your-secret-key

# Multi-site configuration (alternative to single site)
GOOGLE_RECAPTCHA_SITES=[{"siteKey":"site-key-1","secretKey":"secret-key-1","name": "site-1"},{"siteKey":"site-key-2","secretKey":"secret-key-2","name": "site-2"}]

# Validation settings (optional, can also be configured via ConfigService)
GOOGLE_RECAPTCHA_ACTIONS=["SignUp","SignIn","XiaoB","ActivityCreate","Referral","LotteryStart","footer_subscribe"]
GOOGLE_RECAPTCHA_SCORE=0.1
```

### Basic Usage

```typescript
import { GoogleRecaptchaModule } from 'google-recaptcha-multisite';

@Module({
    imports: [
        GoogleRecaptchaModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                // Either use single site configuration
                secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
                // Or use multi-site configuration (no need for secretKey)
                sites: JSON.parse(process.env.GOOGLE_RECAPTCHA_SITES || '[]'),
                // Validation settings - can be configured either way:
                // 1. Via environment variables
                actions: JSON.parse(process.env.GOOGLE_RECAPTCHA_ACTIONS || '[]'),
                score: parseFloat(process.env.GOOGLE_RECAPTCHA_SCORE || '0.1'),
                response: (req) => req.body.recaptcha,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class AppModule {}
```

### Multi-site Configuration

```typescript
// Synchronous configuration
@Module({
    imports: [
        GoogleRecaptchaModule.forRoot({
            sites: [
                { siteKey: 'site-key-1', secretKey: 'secret-key-1' },
                { siteKey: 'site-key-2', secretKey: 'secret-key-2' }
            ],
            response: (req) => req.body.recaptcha,
        }),
    ],
})
export class AppModule {}

// Async configuration
@Module({
    imports: [
        GoogleRecaptchaModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                sites: config.get('googleRecaptcha.sites'),
                response: (req) => req.body.recaptcha,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class AppModule {}
```

### Using Decorator

```typescript
@Controller('auth')
export class AuthController {
    @Recaptcha({
        action: 'login',
        score: 0.8,
    })
    @Post('login')
    login() {
        // Implementation
    }
}
```

### Using Guard

```typescript
@Controller('auth')
@UseGuards(GoogleRecaptchaGuard)
export class AuthController {
    @Post('login')
    login() {
        // Implementation
    }
}
```

## Frontend Integration

1. Set in request headers:
   - `X-Recaptcha-Sitekey`: Site key
   - `recaptcha`: Verification token

2. Example code:
```javascript
// Get verification token
const token = await grecaptcha.execute('your-site-key', {action: 'login'});

// Send request
fetch('/auth/login', {
    method: 'POST',
    headers: {
        'X-Recaptcha-Sitekey': 'your-site-key',
        'recaptcha': token
    },
    body: JSON.stringify({
        // Other request data
    })
});
```

## License

MIT
