import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GoogleRecaptchaValidator } from '../src/services/validators/google-recaptcha.validator';
import { GoogleRecaptchaGuard, GoogleRecaptchaModuleOptions, GoogleRecaptchaModule } from '../src';
import { RECAPTCHA_OPTIONS } from '../src/provider.declarations';

describe('Google recaptcha module', () => {
	const customNetwork = 'CUSTOM_URL';

	const createApp = async (options: GoogleRecaptchaModuleOptions): Promise<INestApplication> => {
		const testingModule = await Test.createTestingModule({
			imports: [GoogleRecaptchaModule.forRoot(options)],
		}).compile();

		return testingModule.createNestApplication();
	};

	let app: INestApplication;

	beforeAll(async () => {
		app = await createApp({
			sites: [
				{
					name: 'site1',
					siteKey: 'site1-key',
					secretKey: 'secret key 1',
					response: (req) => req.headers.authorization,
					skipIf: () => process.env.NODE_ENV !== 'production',
					network: customNetwork,
				},
				{
					name: 'site2',
					siteKey: 'site2-key',
					secretKey: 'secret key 2',
					response: (req) => req.headers.authorization2,
					skipIf: () => false,
					network: customNetwork,
				}
			],
			defaultSite: 'site1',
			global: false,
			response: (req) => req.headers.authorization,
		});
	});

	test('Test validator provider', () => {
		const guard = app.get(GoogleRecaptchaValidator);

		expect(guard).toBeInstanceOf(GoogleRecaptchaValidator);
	});

	test('Test guard provider', () => {
		const guard = app.get(GoogleRecaptchaGuard);

		expect(guard).toBeInstanceOf(GoogleRecaptchaGuard);
	});

	test('Test use recaptcha net options', async () => {
		const options: GoogleRecaptchaModuleOptions = app.get(RECAPTCHA_OPTIONS);

		expect(options).toBeDefined();
		expect(options.sites).toBeDefined();
		if (options.sites) {
			expect(options.sites.length).toBe(2);
			expect(options.sites[0].network).toBe(customNetwork);
			expect(options.sites[1].network).toBe(customNetwork);
		}
		expect(options.defaultSite).toBe('site1');
	});

	test('Test invalid config - no sites and no secretKey', async () => {
		await expect(createApp({ response: () => '' })).rejects.toThrowError('must be contains "secretKey" xor "sites"');
	});

	test('Test invalid config - empty sites array', async () => {
		await expect(createApp({ sites: [], response: () => '' })).rejects.toThrowError('sites array must not be empty');
	});

	test('Test invalid config - invalid defaultSite', async () => {
		await expect(createApp({ 
			sites: [{ name: 'site1', siteKey: 'key1', secretKey: 'secret1' }],
			defaultSite: 'invalid-site',
			response: () => '' 
		})).rejects.toThrowError('defaultSite must be one of the site names');
	});
});
