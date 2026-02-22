import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaWidgetProps {
    onChange: (token: string | null) => void;
}

export interface RecaptchaWidgetHandle {
    reset: () => void;
    getValue: () => string | null;
}

const RecaptchaWidget = forwardRef<RecaptchaWidgetHandle, RecaptchaWidgetProps>(({ onChange }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Default test key

    useImperativeHandle(ref, () => ({
        reset: () => {
            recaptchaRef.current?.reset();
        },
        getValue: () => {
            return recaptchaRef.current?.getValue();
        }
    }));

    return (
        <div className="flex justify-center my-4">
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={onChange}
            />
        </div>
    );
});

RecaptchaWidget.displayName = 'RecaptchaWidget';

export default RecaptchaWidget;
