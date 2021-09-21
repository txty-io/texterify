import { CheckCircleFilled, LoadingOutlined, WarningFilled } from "@ant-design/icons";
import { Button, Form, Input, Layout, List, message, Skeleton } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
    IWordpressPolylangConnection,
    WordpressPolylangConnectionsAPI
} from "../../api/v1/WordpressPolylangConnectionsAPI";
import { Routes } from "../../routing/Routes";
import { Breadcrumbs } from "../../ui/Breadcrumbs";

interface IFormValues {
    wordpressURL: string;
    authUser: string;
}

export const ProjectIntegrationsWordpressSite = observer(() => {
    const params = useParams<{ projectId: string }>();

    const [settingsLoading, setSettingsLoading] = React.useState<boolean>(true);
    const [settingsUpdating, setSettingsUpdating] = React.useState<boolean>(false);
    const [settings, setSettings] = React.useState<IWordpressPolylangConnection>();
    const [websiteReachableLoading, setWebsiteReachableLoading] = React.useState<boolean>(true);
    const [websiteReachable, setWebsiteReachable] = React.useState<boolean>();
    const [wordpressRestActivatedLoading, setWordpressRestActivatedLoading] = React.useState<boolean>(true);
    const [wordpressRestActivated, setWordpressRestActivated] = React.useState<boolean>();

    async function loadWebsiteReachable() {
        try {
            setWebsiteReachableLoading(true);
            const response = await WordpressPolylangConnectionsAPI.websiteReachable({
                projectId: params.projectId
            });

            setWebsiteReachable(response === true);
            setWebsiteReachableLoading(false);
        } catch (error) {
            console.error(error);
            message.error("An unknown error occurred.");
        }
    }

    async function loadWordpressRestActivated() {
        try {
            setWordpressRestActivatedLoading(true);
            const response = await WordpressPolylangConnectionsAPI.wordpressRestActivated({
                projectId: params.projectId
            });

            setWordpressRestActivated(response === true);
            setWordpressRestActivatedLoading(false);
        } catch (error) {
            console.error(error);
            message.error("An unknown error occurred.");
        }
    }

    React.useEffect(() => {
        Promise.all([
            (async () => {
                try {
                    setSettingsLoading(true);
                    const response = await WordpressPolylangConnectionsAPI.getConnection({
                        projectId: params.projectId
                    });
                    setSettings(response);
                    setSettingsLoading(false);
                } catch (error) {
                    console.error(error);
                    message.error("An unknown error occurred.");
                }
            })(),
            loadWebsiteReachable(),
            loadWordpressRestActivated()
        ]);
    }, []);

    async function handleSubmit(values: IFormValues) {
        try {
            setSettingsUpdating(true);
            await WordpressPolylangConnectionsAPI.updateConnection({
                projectId: params.projectId,
                wordpressURL: values.wordpressURL,
                authUser: values.authUser
            });
            setSettingsUpdating(false);

            await Promise.all([loadWebsiteReachable(), loadWordpressRestActivated()]);
        } catch (error) {
            console.error(error);
            message.error("An unknown error occurred.");
        }
    }

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Breadcrumbs breadcrumbName="projectIntegrationsWordpress" />
            <Layout.Content
                style={{
                    margin: "24px 16px 0",
                    minHeight: 360,
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: 1040
                }}
            >
                <h1>WordPress Integration</h1>
                <Link
                    to={Routes.DASHBOARD.PROJECT_INTEGRATIONS_RESOLVER({
                        projectId: params.projectId
                    })}
                    style={{ fontWeight: 600 }}
                >
                    Back to integrations
                </Link>
                <p style={{ marginTop: 8, maxWidth: 800 }}>
                    With the WordPress integration you can sync your content between WordPress and Texterify with ease
                    to make use of the powerful translation tools Texterify offers.
                    <br />
                    <br />
                    Check out the{" "}
                    <a href={Routes.OTHER.WORDPRESS_INTEGRATION_GUIDE} target="_blank">
                        WordPress integration documentation
                    </a>{" "}
                    for setup instructions.
                </p>

                <div style={{ display: "flex", marginTop: 40 }}>
                    {settingsLoading && (
                        <div style={{ width: "50%" }}>
                            <Skeleton />
                            <Skeleton />
                        </div>
                    )}
                    {!settingsLoading && (
                        <Form
                            id="wordpressPolylangSettingsForm"
                            onFinish={handleSubmit}
                            style={{ width: "50%", display: "flex", flexDirection: "column" }}
                            initialValues={{
                                wordpressURL: settings?.data?.attributes.wordpress_url,
                                authUser: settings?.data?.attributes.auth_user
                            }}
                        >
                            <h3>WordPress URL</h3>
                            <p>
                                The URL to your WordPress website (e.g. <i>https://mywordpresswebsite.com</i>).
                            </p>
                            <Form.Item
                                name="wordpressURL"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the URL of your WordPress website."
                                    }
                                ]}
                            >
                                <Input placeholder="Enter your WordPress website URL" />
                            </Form.Item>

                            <h3>Application password</h3>
                            <p>
                                The application password you have created. Please read the{" "}
                                <a href={Routes.OTHER.WORDPRESS_INTEGRATION_GUIDE} target="_blank">
                                    integration guide
                                </a>{" "}
                                to learn how to create an application password. <b>Don't</b> use the password you
                                normally use for logging in to WordPress.
                            </p>
                            <Form.Item
                                name="authUser"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your application password."
                                    }
                                ]}
                            >
                                <Input placeholder="Enter your application password" />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={settingsUpdating}
                                style={{ marginLeft: "auto" }}
                            >
                                Authorize
                            </Button>
                        </Form>
                    )}

                    <div style={{ width: "50%", marginLeft: 80 }}>
                        <h3>Current status</h3>
                        <List
                            style={{ width: "100%" }}
                            bordered
                            dataSource={[
                                {
                                    name: "Website reachable",
                                    valid: websiteReachable,
                                    loading: websiteReachableLoading
                                },
                                {
                                    name: "WordPress REST activated",
                                    valid: wordpressRestActivated,
                                    loading: wordpressRestActivatedLoading
                                }
                            ]}
                            renderItem={(item) => {
                                return (
                                    <List.Item>
                                        {item.name}

                                        <div
                                            style={{
                                                marginLeft: 16,
                                                display: "inline-block"
                                            }}
                                        >
                                            {item.valid && !item.loading && (
                                                <CheckCircleFilled
                                                    style={{
                                                        color: "#25b546"
                                                    }}
                                                />
                                            )}

                                            {!item.valid && !item.loading && (
                                                <WarningFilled
                                                    style={{
                                                        color: "var(--color-warn)"
                                                    }}
                                                />
                                            )}

                                            {item.loading && <LoadingOutlined />}
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />

                        <Button
                            type="primary"
                            onClick={async () => {
                                await WordpressPolylangConnectionsAPI.pullWordpressContent({
                                    projectId: params.projectId
                                });
                            }}
                            style={{ marginTop: 24 }}
                        >
                            Pull content
                        </Button>
                    </div>
                </div>
            </Layout.Content>
        </Layout>
    );
});
