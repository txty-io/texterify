import { Card, Layout, Statistic } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { IUserLicense, UserLicensesAPI } from "../../api/v1/UserLicensesAPI";
import { Licenses } from "../../ui/Licenses";
import { Loading } from "../../ui/Loading";

export const UserLicensesSite = observer(() => {
    const [userLicenses, setUserLicenses] = React.useState<IUserLicense[]>();
    const [loading, setLoading] = React.useState<boolean>(true);

    async function loadUserLicenses() {
        try {
            const getUserLicensesResponse = await UserLicensesAPI.getLicenses();
            setUserLicenses(getUserLicensesResponse.data);
        } catch (e) {
            console.error(e);
        }
    }

    async function onInit() {
        setLoading(true);
        await loadUserLicenses();
        setLoading(false);
    }

    React.useEffect(() => {
        onInit();
    }, []);

    function renderLicense(options: { license: IUserLicense; disabled?: boolean; isLast?: boolean }) {
        return (
            <Card
                type="inner"
                title="License"
                key={options.license.id}
                style={{ display: "flex", flexDirection: "column", marginBottom: options.isLast ? 0 : 8 }}
            >
                <Card.Grid hoverable={false} style={{ width: "100%" }}>
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="E-Mail"
                        value={options.license.attributes.licensee.email}
                    />
                </Card.Grid>
                <Card.Grid hoverable={false} style={{ width: 100 / 3 + "%" }}>
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="Starts at"
                        value={options.license.attributes.starts_at}
                    />
                </Card.Grid>
                <Card.Grid hoverable={false} style={{ width: 100 / 3 + "%" }}>
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="Expires at"
                        value={options.license.attributes.expires_at}
                    />
                </Card.Grid>
                <Card.Grid hoverable={false} style={{ width: 100 / 3 + "%" }}>
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="Max active users"
                        value={options.license.attributes.restrictions.active_users_count}
                    />
                </Card.Grid>
            </Card>
        );
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0" }}>
                <h1>Get a license</h1>
                <p style={{ maxWidth: 480, marginTop: 16 }}>
                    Setup Texterify in your own infrastructure. Make sure that your data never leaves your own
                    infrastructure. Requires technical experience for installation. You can also get a subscription for
                    the cloud version of Texterify in the subscription tab of your organization.
                </p>

                <div style={{ display: "flex" }}>
                    {userLicenses?.length > 0 && (
                        <div style={{ width: 600, marginRight: 40 }}>
                            <h3 style={{ marginTop: 24 }}>Your licenses</h3>
                            {userLicenses.map((license, index) => {
                                const isLast = index === userLicenses.length - 1;

                                return renderLicense({ license: license, isLast: isLast });
                            })}
                        </div>
                    )}

                    <div style={{ flexGrow: 1, maxWidth: 1000 }}>
                        <h3 style={{ marginTop: 24 }}>Get a new license</h3>
                        <Licenses hostingType="on-premise" annualBilling />
                    </div>
                </div>
            </Layout.Content>
        </Layout>
    );
});
