

import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import https from "https";
import btoa from "btoa";

const api_key = process.env.BEEM_API_KEY!;
const secret_key = process.env.BEEM_SECRET_KEY!;
const source_addr = process.env.SOURCE_ADDRESS!;
const content_type = "application/json";

const formatPhoneNumber = (phoneNumber: string): string => {
    if (phoneNumber.startsWith('0') && phoneNumber.length === 10) {
        return '255' + phoneNumber.substring(1);
    }
    return phoneNumber;
};

interface Recipient {
    phone: string;
}

export function send_sms(message: string, recipients: Recipient[]): void {
    axios
        .post(
            "https://apisms.beem.africa/v1/send",
            {
                source_addr,
                schedule_time: "",
                encoding: 0,
                message,
                recipients: recipients.map((recipient, index) => ({
                    recipient_id: index + 1,
                    dest_addr: formatPhoneNumber(recipient.phone),
                })),
            },
            {
                headers: {
                    "Content-Type": content_type,
                    Authorization: "Basic " + btoa(`${api_key}:${secret_key}`),
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            }
        )
        .then((response) => console.log("SMS sent:", response.data))
        .catch((error) => {
            if (error.response?.data) {
                console.error("SMS error:", error.response.data);
            } else {
                console.error("SMS error:", error.message);
            }
        });
}
