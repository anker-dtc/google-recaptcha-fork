import { GoogleRecaptchaNetwork } from '../enums/google-recaptcha-network';
import { AxiosRequestConfig } from 'axios';
import { RecaptchaResponseProvider, SkipIfValue } from '../types';

export interface GoogleRecaptchaSiteConfig {
    name: string;
    siteKey: string;
    secretKey: string;
    response?: RecaptchaResponseProvider;
    skipIf?: SkipIfValue;
    network?: GoogleRecaptchaNetwork | string;
    axiosConfig?: AxiosRequestConfig;
} 