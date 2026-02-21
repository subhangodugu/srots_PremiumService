import api from './api';

export interface PremiumSubscriptionRequest {
    utrNumber: string;
}

export interface PremiumResponse {
    message: string;
}

export const PremiumService = {
    subscribe: async (data: PremiumSubscriptionRequest): Promise<PremiumResponse> => {
        const response = await api.post('/premium/subscribe', data);
        return response.data;
    }
};
