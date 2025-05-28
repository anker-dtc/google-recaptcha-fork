import { Injectable, Inject } from '@nestjs/common';
import { GoogleRecaptchaEnterpriseValidator } from './validators/google-recaptcha-enterprise.validator';
import { GoogleRecaptchaValidator } from './validators/google-recaptcha.validator';
import { AbstractGoogleRecaptchaValidator } from './validators/abstract-google-recaptcha-validator';
import { RecaptchaConfigRef } from '../models/recaptcha-config-ref';
import { GoogleRecaptchaException } from '../exceptions/google-recaptcha.exception';
import { ErrorCode } from '../enums/error-code';
import { RECAPTCHA_AXIOS_INSTANCE, RECAPTCHA_LOGGER } from '../provider.declarations';
import { AxiosInstance } from 'axios';
import { Logger } from '@nestjs/common';
import { EnterpriseReasonTransformer } from './enterprise-reason.transformer';

@Injectable()
export class RecaptchaValidatorResolver {
	constructor(
		private readonly configRef: RecaptchaConfigRef,
		@Inject(RECAPTCHA_AXIOS_INSTANCE) private readonly axios: AxiosInstance,
		@Inject(RECAPTCHA_LOGGER) private readonly logger: Logger,
		private readonly enterpriseReasonTransformer: EnterpriseReasonTransformer
	) {}

	resolve(siteKey?: string): AbstractGoogleRecaptchaValidator<unknown> {
		if (this.configRef.valueOf.enterprise) {
			return new GoogleRecaptchaEnterpriseValidator(
				this.axios,
				this.logger,
				this.configRef,
				this.enterpriseReasonTransformer
			);
		}

		const validator = new GoogleRecaptchaValidator(
			this.axios,
			this.logger,
			this.configRef
		);

		// 如果提供了 siteKey，从多站点配置中查找对应的 secretKey
		if (siteKey && this.configRef.valueOf.sites) {
			const siteConfig = this.configRef.valueOf.sites.find(site => site.siteKey === siteKey);
			if (!siteConfig) {
				throw new GoogleRecaptchaException(
					[ErrorCode.MissingInputSecret],
					`No secret key found for site key: ${siteKey}`
				);
			}
			validator.setCurrentSecretKey(siteConfig.secretKey);
			return validator;
		}

		// 如果没有提供 siteKey 但有多站点配置，使用第一组配置
		if (this.configRef.valueOf.sites?.length > 0) {
			validator.setCurrentSecretKey(this.configRef.valueOf.sites[0].secretKey);
			return validator;
		}

		// 如果没有多站点配置，使用默认的 secretKey
		return validator;
	}
}
