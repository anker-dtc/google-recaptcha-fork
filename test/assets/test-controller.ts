import { Controller, UseGuards } from '@nestjs/common';
import { GoogleRecaptchaGuard, Recaptcha } from '../../src';
import { SetRecaptchaOptions } from '../../src/decorators/set-recaptcha-options';

@Controller('test')
export class TestController {
	@Recaptcha()
	submit(): void {
		return;
	}

	@Recaptcha({ response: (req) => req.body.customRecaptchaField })
	submitOverridden(): void {
		return;
	}

	@Recaptcha({ site: 'site2' })
	submitSite2(): void {
		return;
	}

	@SetRecaptchaOptions({ action: 'TestOptions', score: 0.5 })
	@UseGuards(GoogleRecaptchaGuard)
	submitWithSetRecaptchaOptionsDecorator(): void {
		return;
	}
}
