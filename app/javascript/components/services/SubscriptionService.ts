import { ISubscription, OrganizationsAPI } from "../api/v1/OrganizationsAPI";

class SubscriptionService {
    subscriptionStorage: { [key: string]: ISubscription } = {};

    async getActiveSubscription(organizationId: string) {
        if (this.subscriptionStorage[organizationId] === undefined) {
            const subscriptionResponse = await OrganizationsAPI.getOrganizationSubscription(organizationId);
            this.subscriptionStorage[organizationId] = subscriptionResponse.data;
        }

        return this.subscriptionStorage[organizationId];
    }
}

const subscriptionService = new SubscriptionService();

export { subscriptionService };
