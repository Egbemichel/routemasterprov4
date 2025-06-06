// lib/email.ts
import emailjs from 'emailjs-com';

export const sendEmail = (templateParams: {
    to_email: string;
    tracking_number: string;
    receiver_name: string;
    package_content: string;
    sender_name: string;
    sender_address: string;
    tracking_url: string;
}) => {
    return emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID!
    );
};
