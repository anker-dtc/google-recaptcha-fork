# @anker-dtc/google-recaptcha

[![npm version](https://img.shields.io/npm/v/@anker-dtc/google-recaptcha.svg)](https://www.npmjs.com/package/@anker-dtc/google-recaptcha)
[![npm](https://img.shields.io/npm/dt/@anker-dtc/google-recaptcha.svg)](https://www.npmjs.com/package/@anker-dtc/google-recaptcha)
[![npm](https://img.shields.io/npm/l/@anker-dtc/google-recaptcha.svg)](https://www.npmjs.com/package/@anker-dtc/google-recaptcha)

Google reCAPTCHA (v2/v3) module for NestJS framework.

## Installation

```bash
npm i @anker-dtc/google-recaptcha
```

## Quick start

### Basic usage

```typescript
import { GoogleRecaptchaModule } from '@anker-dtc/google-recaptcha';

@Module({
    imports: [
        GoogleRecaptchaModule.forRoot({
            secretKey: 'your-secret-key',
            response: (req) => req.body.recaptcha,
            skipIf: () => process.env.NODE_ENV !== 'production',
        }),
    ],
})
export class AppModule {}
```

### Multi-site Configuration

支持多站点配置，可以根据请求头中的 `X-Recaptcha-Sitekey` 动态选择对应的 secretKey：

```typescript
import { GoogleRecaptchaModule } from '@anker-dtc/google-recaptcha';

@Module({
    imports: [
        GoogleRecaptchaModule.forRoot({
            sites: [
                { siteKey: 'site-key-1', secretKey: 'secret-key-1' },
                { siteKey: 'site-key-2', secretKey: 'secret-key-2' }
            ],
            response: (req) => req.body.recaptcha,
            skipIf: () => process.env.NODE_ENV !== 'production',
        }),
    ],
})
export class AppModule {}
```

使用说明：
1. 在模块配置中通过 `sites` 数组配置多组 siteKey 和 secretKey
2. 客户端在请求头中设置 `X-Recaptcha-Sitekey` 来指定使用哪组配置
3. 如果请求头中没有提供 siteKey，将使用第一组配置进行验证

### Use with decorator

```typescript
import { Controller, Post } from '@nestjs/common';
import { Recaptcha } from '@anker-dtc/google-recaptcha';

@Controller('auth')
export class AuthController {
    @Recaptcha({
        response: (req) => req.body.recaptcha,
        action: 'login',
        score: 0.8,
    })
    @Post('login')
    login() {
        // Your implementation
    }
}
```

### Use with guard

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { GoogleRecaptchaGuard } from '@anker-dtc/google-recaptcha';

@Controller('auth')
@UseGuards(GoogleRecaptchaGuard)
export class AuthController {
    @Post('login')
    login() {
        // Your implementation
    }
}
```

## Configuration

| Property                        | Description |
|---------------------------------|-------------|
| `secretKey`                     | **Required.**<br> Type: `string`<br> Your secret key. <br> You can get a key from [reCAPTCHA Admin](https://www.google.com/recaptcha/admin) |
| `response`                      | **Required.**<br> Type: `(request) => string`<br> A function that returns a token from the request. |
| `remoteIp`                      | **Optional.**<br> Type: `(request) => string`<br> A function that returns a remote ip from the request. |
| `skipIf`                        | **Optional.**<br> Type: `boolean \| (request) => boolean`<br> Skip validation if the function returns true. |
| `debug`                         | **Optional.**<br> Type: `boolean`<br> Enable debug mode. |
| `logger`                        | **Optional.**<br> Type: `Logger`<br> Custom logger. |
| `network`                       | **Optional.**<br> Type: `string`<br> Custom network url. |
| `score`                         | **Optional.**<br> Type: `number`<br> Score threshold. |
| `actions`                       | **Optional.**<br> Type: `string[]`<br> List of allowed actions. |
| `axiosConfig`                   | **Optional.**<br> Type: `AxiosRequestConfig`<br> Custom axios config. |
| `global`                        | **Optional.**<br> Type: `boolean`<br> Set the guard as global. |
| `sites`                         | **Optional.**<br> Type: `Array<{siteKey: string, secretKey: string}>`<br> Multi-site configuration. |

## Decorator options

| Property                        | Description |
|---------------------------------|-------------|
| `response`                      | **Optional.**<br> Type: `(request) => string`<br> Override the global response provider. |
| `remoteIp`                      | **Optional.**<br> Type: `(request) => string`<br> Override the global remote ip provider. |
| `action`                        | **Optional.**<br> Type: `string`<br> Override the global action. |
| `score`                         | **Optional.**<br> Type: `number`<br> Override the global score threshold. |

## Enterprise

```typescript
import { GoogleRecaptchaModule } from '@anker-dtc/google-recaptcha';

@Module({
    imports: [
        GoogleRecaptchaModule.forRoot({
            enterprise: {
                projectId: 'your-project-id',
                siteKey: 'your-site-key',
                apiKey: 'your-api-key',
            },
            response: (req) => req.body.recaptcha,
        }),
    ],
})
export class AppModule {}
```

## License

MIT
