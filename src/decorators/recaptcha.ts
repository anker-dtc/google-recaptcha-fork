import { applyDecorators, UseGuards } from '@nestjs/common';
import { GoogleRecaptchaGuard } from '../guards/google-recaptcha.guard';
import { VerifyResponseDecoratorOptions } from '../interfaces/verify-response-decorator-options';
import { SetRecaptchaOptions } from './set-recaptcha-options';

export function Recaptcha(options?: VerifyResponseDecoratorOptions): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		return applyDecorators(SetRecaptchaOptions(options), UseGuards(GoogleRecaptchaGuard))(target, propertyKey, descriptor);
	};
}
