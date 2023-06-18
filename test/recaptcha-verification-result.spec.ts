import { Controller, INestApplication, Post } from '@nestjs/common';
import { GoogleRecaptchaModule, Recaptcha, RecaptchaResult, RecaptchaVerificationResult } from '../src';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { VerifyResponseV3 } from '../src/interfaces/verify-response';
import * as request from 'supertest';
import { RECAPTCHA_AXIOS_INSTANCE } from '../src/provider.declarations';
import axios from 'axios';

@Controller('test')
class TestController {
	@Recaptcha()
	@Post('submit')
	testAction(@RecaptchaResult() result: RecaptchaVerificationResult): string {
		expect(result).toBeInstanceOf(RecaptchaVerificationResult);
		expect(result.success).toBeTruthy();

		expect(result.getEnterpriseRiskAnalytics()).toBeNull();
		expect(result.getResponse()).toBeDefined();

		return 'OK';
	}
}

describe('Recaptcha verification result decorator', () => {
	let module: TestingModule;
	let app: INestApplication;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [
				GoogleRecaptchaModule.forRoot({
					response: (req: Request): string => req.headers.recaptcha?.toString(),
					secretKey: 'secret',
				}),
			],
			controllers: [TestController],
		})
			.overrideProvider(RECAPTCHA_AXIOS_INSTANCE)
			.useFactory({
				factory: () => {
					const responseV3: VerifyResponseV3 = {
						success: true,
						action: 'Submit',
						errors: [],
						score: 0.9,
						hostname: 'localhost',
						challenge_ts: new Date().toISOString(),
					};
					return Object.assign(axios.create({}), {
						post: () =>
							Promise.resolve({
								data: responseV3,
							}),
					});
				},
			})
			.compile();

		app = module.createNestApplication();

		await app.init();
	});

	test('Test', () => {
		return request(app.getHttpServer()).post('/test/submit').expect(201).expect('OK');
	});
});
