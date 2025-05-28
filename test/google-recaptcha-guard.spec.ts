import { GoogleRecaptchaException, GoogleRecaptchaGuard, GoogleRecaptchaModuleOptions } from '../src';
import { Reflector } from '@nestjs/core';
import { GoogleRecaptchaGuardOptions } from '../src/interfaces/google-recaptcha-guard-options';
import { createGoogleRecaptchaValidator } from './helpers/create-google-recaptcha-validator';
import { GoogleRecaptchaValidatorOptions } from '../src/interfaces/google-recaptcha-validator-options';
import { createExecutionContext } from './helpers/create-execution-context';
import { TestController } from './assets/test-controller';
import { TestRecaptchaNetwork } from './network/test-recaptcha-network';
import { RecaptchaRequestResolver } from '../src/services/recaptcha-request.resolver';
import { Logger } from '@nestjs/common';
import { createGoogleRecaptchaEnterpriseValidator } from './helpers/create-google-recaptcha-enterprise-validator';
import { RecaptchaValidatorResolver } from '../src/services/recaptcha-validator.resolver';
import { RecaptchaConfigRef } from '../src/models/recaptcha-config-ref';

describe('Google recaptcha guard', () => {
	let network: TestRecaptchaNetwork;
	const networkPort = 6048;
	const validatorOptions: GoogleRecaptchaValidatorOptions = {
		sites: [
			{
				name: 'site1',
				siteKey: 'site1-key',
				secretKey: 'Secret1',
			},
			{
				name: 'site2',
				siteKey: 'site2-key',
				secretKey: 'Secret2',
			}
		],
		defaultSite: 'site1',
	};
	const guardOptions: GoogleRecaptchaGuardOptions = {
		response: (req) => req.body.recaptcha,
	};

	const controller = new TestController();

	beforeAll(async () => {
		network = await TestRecaptchaNetwork.create(networkPort);
	});

	afterAll(async () => {
		await network.close();
	});

	test('SkipIf = true + default response provider', async () => {
		const options = { ...validatorOptions, ...guardOptions };
		const validator = createGoogleRecaptchaValidator(options);
		const enterpriseValidator = createGoogleRecaptchaEnterpriseValidator(options);
		const configRef = new RecaptchaConfigRef(options);
		const validatorResolver = new RecaptchaValidatorResolver(configRef, validator, enterpriseValidator);

		const guard = new GoogleRecaptchaGuard(
			new Reflector(),
			new RecaptchaRequestResolver(),
			validatorResolver,
			new Logger(),
			new RecaptchaConfigRef({ ...options, skipIf: true }),
		);

		const context = createExecutionContext(controller.submit, { body: { recaptcha: 'RECAPTCHA_TOKEN' } });

		const canActivate = await guard.canActivate(context);

		expect(canActivate).toBeTruthy();
	});

	test('SkipIf = (req) => true + overridden response provider', async () => {
		const options = { ...validatorOptions, ...guardOptions };
		const validator = createGoogleRecaptchaValidator(options);
		const enterpriseValidator = createGoogleRecaptchaEnterpriseValidator(options);
		const validatorResolver = new RecaptchaValidatorResolver(
			new RecaptchaConfigRef(options),
			validator,
			enterpriseValidator,
		);

		const guard = new GoogleRecaptchaGuard(
			new Reflector(),
			new RecaptchaRequestResolver(),
			validatorResolver,
			new Logger(),
			new RecaptchaConfigRef({ ...options, skipIf: (): boolean => true }),
		);

		const context = createExecutionContext(controller.submitOverridden.prototype, { body: { recaptcha: 'RECAPTCHA_TOKEN' } });

		const canActivate = await guard.canActivate(context);

		expect(canActivate).toBeTruthy();
	});

	test('Invalid secret', async () => {
		const options = { ...validatorOptions, ...guardOptions };
		const validator = createGoogleRecaptchaValidator(options);
		const enterpriseValidator = createGoogleRecaptchaEnterpriseValidator(options);
		const validatorResolver = new RecaptchaValidatorResolver(
			new RecaptchaConfigRef(options),
			validator,
			enterpriseValidator,
		);

		const guard = new GoogleRecaptchaGuard(
			new Reflector(),
			new RecaptchaRequestResolver(),
			validatorResolver,
			new Logger(),
			new RecaptchaConfigRef(options),
		);

		const context = createExecutionContext(controller.submit, { 
			body: { recaptcha: 'RECAPTCHA_TOKEN' },
			headers: { 'x-recaptcha-sitekey': 'invalid-site-key' }
		});

		await guard
			.canActivate(context)
			.then(() => expect(true).toBeFalsy())
			.catch((e) => expect(e).toBeInstanceOf(GoogleRecaptchaException));
	});

	test('Invalid network', async () => {
		const options = {
			...validatorOptions,
			...guardOptions,
			sites: [
				{
					name: 'site1',
					siteKey: 'site1-key',
					secretKey: 'Secret1',
					network: 'https://localhost/some-invalid-path',
				},
				{
					name: 'site2',
					siteKey: 'site2-key',
					secretKey: 'Secret2',
					network: 'https://localhost/some-invalid-path',
				}
			],
		};

		const validator = createGoogleRecaptchaValidator(options);
		const enterpriseValidator = createGoogleRecaptchaEnterpriseValidator(options);
		const validatorResolver = new RecaptchaValidatorResolver(
			new RecaptchaConfigRef(options),
			validator,
			enterpriseValidator,
		);

		const guard = new GoogleRecaptchaGuard(
			new Reflector(),
			new RecaptchaRequestResolver(),
			validatorResolver,
			new Logger(),
			new RecaptchaConfigRef({ ...guardOptions, ...validatorOptions }),
		);

		const context = createExecutionContext(controller.submit, { 
			body: { recaptcha: 'RECAPTCHA_TOKEN' },
			headers: { 'x-recaptcha-sitekey': 'site1-key' }
		});

		await guard
			.canActivate(context)
			.then(() => expect(true).toBeFalsy())
			.catch((e) => expect(e).toBeInstanceOf(GoogleRecaptchaException));
	});

	test('Valid - Site1', async () => {
		network.setResult({
			success: true,
		});
		const options = {
			...validatorOptions,
			...guardOptions,
			sites: [
				{
					name: 'site1',
					siteKey: 'site1-key',
					secretKey: 'Secret1',
					network: network.url,
				},
				{
					name: 'site2',
					siteKey: 'site2-key',
					secretKey: 'Secret2',
					network: network.url,
				}
			],
		};

		const validator = createGoogleRecaptchaValidator(options);
		const enterpriseValidator = createGoogleRecaptchaEnterpriseValidator(options);
		const validatorResolver = new RecaptchaValidatorResolver(new RecaptchaConfigRef(options), validator, enterpriseValidator);

		const guard = new GoogleRecaptchaGuard(new Reflector(), new RecaptchaRequestResolver(), validatorResolver, new Logger(), new RecaptchaConfigRef(options));

		const context = createExecutionContext(controller.submit, { 
			body: { recaptcha: 'RECAPTCHA_TOKEN' },
			headers: { 'x-recaptcha-sitekey': 'site1-key' }
		});

		const canActivate = await guard.canActivate(context);

		expect(canActivate).toBeTruthy();
	});

	test('Valid - Site2', async () => {
		network.setResult({
			success: true,
		});
		const options = {
			...validatorOptions,
			...guardOptions,
			sites: [
				{
					name: 'site1',
					siteKey: 'site1-key',
					secretKey: 'Secret1',
					network: network.url,
				},
				{
					name: 'site2',
					siteKey: 'site2-key',
					secretKey: 'Secret2',
					network: network.url,
				}
			],
		};

		const validator = createGoogleRecaptchaValidator(options);
		const enterpriseValidator = createGoogleRecaptchaEnterpriseValidator(options);
		const validatorResolver = new RecaptchaValidatorResolver(new RecaptchaConfigRef(options), validator, enterpriseValidator);

		const guard = new GoogleRecaptchaGuard(new Reflector(), new RecaptchaRequestResolver(), validatorResolver, new Logger(), new RecaptchaConfigRef(options));

		const context = createExecutionContext(controller.submitSite2, { 
			body: { recaptcha: 'RECAPTCHA_TOKEN' },
			headers: { 'x-recaptcha-sitekey': 'site2-key' }
		});

		const canActivate = await guard.canActivate(context);

		expect(canActivate).toBeTruthy();
	});
});
