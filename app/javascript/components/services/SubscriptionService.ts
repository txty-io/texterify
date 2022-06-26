import { ISubscription, OrganizationsAPI } from "../api/v1/OrganizationsAPI";

class SubscriptionService {
    subscriptionStorage: { [key: string]: ISubscription } = {};

    async getActiveSubscription(organizationId: string, options?: { forceReload?: boolean }) {
        if (this.subscriptionStorage[organizationId] === undefined || options?.forceReload) {
            const subscriptionResponse = await OrganizationsAPI.getOrganizationSubscription(organizationId);
            this.subscriptionStorage[organizationId] = subscriptionResponse.data;
        }

        return this.subscriptionStorage[organizationId];
    }

    async getCustomSubscription(organizationId: string) {
        const customSubscription = await OrganizationsAPI.getOrganizationCustomSubscription(organizationId);
        return customSubscription.data;
    }
}

const subscriptionService = new SubscriptionService();

export { subscriptionService };
