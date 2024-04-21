export interface RequestData {
    transactionId: string;
    userId: string;
    transactionDetails: {
        amount: number;
        currency: string;
        transactionDate: string;
        paymentMethod: string;
        merchantDetails: {
            merchantId: string;
            name: string;
            category: string;
            countryCode: string;
        };
    };
    userDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        billingAddress: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
    };
    additionalInfo: {
        deviceIp: string;
        userAgent: string;
    };
}


interface EnrichedData {
    transactionId: string;
    userId: string;
    transactionDetails: {
        amount: number;
        currency: string;
        transactionDate: string;
        paymentMethod: string;
        merchantDetails: {
            merchantId: string;
            name: string;
            category: string;
            countryCode: string;
        };
    };
    userDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        billingAddress: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
    };
    additionalInfo: AdditionalInfo;
    risk: number; // Added risk attribute
}

interface AdditionalInfo {
    currencyConversionRates: any;
    regionalEconomicIndicators: any;
    transactionType: string;
}