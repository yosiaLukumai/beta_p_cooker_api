import { ResponseAPI } from "../types/Response";

export const CreateResponse = (success: boolean, body: any, error?: any): ResponseAPI => {
    return {
        success,
        body,
        error: error?.message  || error?._message || error || null,
    };
}