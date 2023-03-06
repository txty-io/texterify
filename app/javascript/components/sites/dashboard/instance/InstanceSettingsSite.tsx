import { Button, Form, Input, Layout, message, Skeleton } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import * as React from "react";
import { IInstanceInfo, InstanceAPI } from "../../../api/v1/InstanceAPI";

export function InstanceSettingsSite() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [instanceInfos, setInstanceInfos] = React.useState<IInstanceInfo>();

    async function loadInstance() {
        try {
            const infos = await InstanceAPI.getInstanceInfos();
            setInstanceInfos(infos);
        } catch (e) {
            console.error(e);
        }
    }

    async function onInit() {
        setLoading(true);
        await loadInstance();
        setLoading(false);
    }

    React.useEffect(() => {
        onInit();
    }, []);

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 400 }}>
                <h1>Instance settings</h1>
                {!instanceInfos && <Skeleton />}

                {instanceInfos && (
                    <Form
                        onFinish={async (values: { signUpEnabled: boolean }) => {
                            setLoading(true);
                            try {
                                await InstanceAPI.setSignUpEnabled({ signUpEnabled: values.signUpEnabled });
                                message.success("Successfully updated sign up status.");
                            } catch (error) {
                                console.error(error);
                                message.error("An unknown error occurred.");
                            }
                            setLoading(false);
                        }}
                        initialValues={{
                            signUpEnabled: instanceInfos.sign_up_enabled
                        }}
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        <h3 style={{ marginTop: 24 }}>Enable/disable sign up</h3>
                        <p>
                            If you disable sign up only people with invites to a project or an organization can create
                            an account.
                        </p>

                        <Form.Item noStyle shouldUpdate>
                            {() => {
                                return (
                                    <>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <Form.Item
                                                name="signUpEnabled"
                                                rules={[{ required: false }]}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Checkbox disabled={loading}>Sign up enabled</Checkbox>
                                            </Form.Item>
                                        </div>
                                    </>
                                );
                            }}
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ marginLeft: "auto", marginTop: 8 }}
                            loading={loading}
                        >
                            Save
                        </Button>
                    </Form>
                )}

                {instanceInfos && (
                    <Form
                        onFinish={async (values: { domainFilter: string }) => {
                            setLoading(true);
                            try {
                                await InstanceAPI.saveDomainFilter({ domainFilter: values.domainFilter });
                                message.success("Successfully updated domain filter.");
                            } catch (error) {
                                console.error(error);
                                message.error("An unknown error occurred.");
                            }
                            setLoading(false);
                        }}
                        initialValues={{
                            domainFilter: instanceInfos.domain_filter
                        }}
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        <h3 style={{ marginTop: 24 }}>Domain filter</h3>
                        <p>
                            A domain filter lets you specify the domain part of email addresses that are allowed to sign
                            up. If you leave this field blank every email address can be used for sign up.
                        </p>
                        <Form.Item
                            name="domainFilter"
                            rules={[{ required: false, whitespace: true, message: "Please enter a domain." }]}
                        >
                            <Input addonBefore="john@" placeholder="txty.io" disabled={loading} />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ marginLeft: "auto", marginTop: 8 }}
                            loading={loading}
                        >
                            Save
                        </Button>
                    </Form>
                )}
            </Layout.Content>
        </Layout>
    );
}
