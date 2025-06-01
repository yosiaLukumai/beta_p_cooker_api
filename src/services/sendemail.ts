import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);


export const send_email = async (emails: string[], message: string): Promise<any> => {
    try {
        const response = await resend.emails.send({
            from: "genebank@vortan.io",
            to: emails,
            subject: "Alert Threshold Compromised",
            html: message,
        });
        if (response.data?.id) {
            return "Email sent successfully";
        } else {
            return "Failed to send email";
        }
    }
    catch (error: any) {
        return error.message || error.toString() || error;
    }
}