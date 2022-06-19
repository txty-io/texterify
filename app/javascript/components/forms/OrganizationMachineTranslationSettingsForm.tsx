import { Button, Form, Input, message } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import * as React from "react";
import { OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { dashboardStore, IOrganization } from "../stores/DashboardStore";
import { ErrorUtils } from "../ui/ErrorUtils";
import { Loading } from "../ui/Loading";
import { OkIndicator } from "../ui/OkIndicator";
import { WarningIndicator } from "../ui/WarningIndicator";

export function OrganizationMachineTranslationSettingsForm(props: { organization: IOrganization }) {
    const [saving, setSaving] = React.useState(false);

    const [form] = Form.useForm();

    async function onSubmit(values: { deeplAPIToken: string }) {
        setSaving(true);

        try {
            const response = await OrganizationsAPI.updateMachineTranslationSettings({
                organizationId: props.organization.id,
                deeplAPIToken: values.deeplAPIToken || null
            });
            if (response.error && response.details === "INVALID_DEEPL_API_TOKEN") {
                ErrorUtils.showError("The provided DeepL API token is invalid.");
            } else {
                dashboardStore.currentOrganization = response.data;
                message.success("Successfully updated machine translation settings.");
            }
        } catch (error) {
            console.error(error);
            ErrorUtils.showError("An error occurred while updating machine translation settings.");
        }

        form.resetFields();
        setSaving(false);
    }

    if (!props.organization) {
        return <Loading text="Organization loading..." />;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <Form form={form} onFinish={onSubmit} style={{ maxWidth: "100%" }}>
                <h4>DeepL API Token</h4>
                <p>
                    Set your own DeepL API Token and use your own account for machine translation. After setting your
                    token your DeepL account is used for all projects of your organization.
                </p>
                {props.organization.attributes.deepl_api_token && (
                    <>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <b>Current token:</b>
                            <Paragraph style={{ marginBottom: 0, marginTop: 4, marginLeft: 8 }} code>
                                {`${props.organization.attributes.deepl_api_token}`}
                            </Paragraph>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <b>Token valid:</b>
                            {props.organization.attributes.deepl_api_token_type !== null ? (
                                <OkIndicator style={{ marginLeft: 8 }} />
                            ) : (
                                <WarningIndicator
                                    style={{ marginLeft: 8 }}
                                    tooltip="We couldn't authenticate against the DeepL API with the provided DeepL API Token."
                                />
                            )}
                        </div>
                    </>
                )}
                <Form.Item name="deeplAPIToken" rules={[{ required: false }]}>
                    <Input placeholder="DeepL API Token" type="password" />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button type="primary" htmlType="submit" loading={saving}>
                            Save
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
}
