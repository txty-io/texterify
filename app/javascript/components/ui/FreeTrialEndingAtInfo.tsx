import * as React from "react";
import { useOrganization } from "../network/useOrganization";
import { CustomAlert } from "./CustomAlert";
import { ICustomSubscription, ISubscription } from "../api/v1/OrganizationsAPI";
import { subscriptionService } from "../services/SubscriptionService";

export function FreeTrialEndingAtInfo(props: { organizationId: string | undefined }) {
    const { data: organizationData, isLoading: organizationDataLoading } = useOrganization({
        organizationId: props.organizationId
    });

    const [activeSubscription, setActiveSubscription] = React.useState<ISubscription | null>(null);
    const [customSubscription, setCustomSubscription] = React.useState<ICustomSubscription | null>(null);

    React.useEffect(() => {
        (async () => {
            try {
                const activeSub = await subscriptionService.getActiveSubscription(
                    this.props.match.params.organizationId,
                    {
                        forceReload: true
                    }
                );

                setActiveSubscription(activeSub);
            } catch (error) {
                console.error(error);
            }

            try {
                const customSub = await subscriptionService.getCustomSubscription(
                    this.props.match.params.organizationId
                );

                setCustomSubscription(customSub);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    if (customSubscription || organizationDataLoading || !organizationData?.data.attributes.trial_active) {
        return null;
    }

    return (
        <>
            <p>
                Your trial period ends on:{" "}
                <span style={{ fontWeight: "bold", marginLeft: 8 }}>
                    {organizationData.data.attributes.trial_ends_at}
                </span>
            </p>

            {!activeSubscription && (
                <CustomAlert
                    description={
                        <>
                            Your are currently on the trial period. You can experience all features during the trial for
                            free. Select a plan that fits your needs to continue using the premium features after your
                            trial ends. If you have any questions contact us by sending us an email to{" "}
                            <a href="mailto:support@texterify.com" target="_blank">
                                support@texterify.com
                            </a>
                            .
                        </>
                    }
                    type="info"
                    style={{ maxWidth: 560, marginBottom: 24 }}
                />
            )}
        </>
    );
}
