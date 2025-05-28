import { GoogleRecaptchaModuleOptions, GoogleRecaptchaNetwork } from '../../src';
import * as https from 'https';

export class TestConfigService {
	getGoogleRecaptchaOptions(): GoogleRecaptchaModuleOptions {
		return {
			sites: [
				{
					name: 'site1',
					secretKey: 'secret1',
					response: (req) => req.body.recaptcha,
					skipIf: () => true,
					network: GoogleRecaptchaNetwork.Google,
					axiosConfig: {
						httpsAgent: new https.Agent({
							timeout: 15_000,
						}),
					},
				},
				{
					name: 'site2',
					secretKey: 'secret2',
					response: (req) => req.body.recaptcha2,
					skipIf: () => false,
					network: GoogleRecaptchaNetwork.Google,
					axiosConfig: {
						httpsAgent: new https.Agent({
							timeout: 15_000,
						}),
					},
				}
			],
			defaultSite: 'site1'
		};
	}
}
