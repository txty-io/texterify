import { Button, Checkbox, Form, message } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { MachineTranslationSidebar } from "../../ui/MachineTranslationSidebar";

interface IAutoTranslation {
    machineTranslationEnabled: boolean;
    autoTranslateNewKeys: boolean;
    autoTranslateNewLanguages: boolean;
}

export function ProjectMachineTranslationSettingsSite() {
    const params = useParams<{ projectId: string }>();
    const [settingsSubmitting, setSettingsSubmitting] = React.useState<boolean>(false);

    return (
        <LayoutWithSidebar>
            <MachineTranslationSidebar projectId={params.projectId} />

            <LayoutWithSidebarContentWrapper>
                <Breadcrumbs breadcrumbName="projectMachineTranslationSettings" />
                <LayoutWithSidebarContentWrapperInner size="small">
                    <h1>Settings</h1>

                    {!dashboardStore.featureEnabled("FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE") && (
                        <FeatureNotAvailable feature="FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE" />
                    )}
                    <Form
                        id="machineTranslationSettingsForm"
                        onFinish={async (values: IAutoTranslation) => {
                            setSettingsSubmitting(true);
                            try {
                                await ProjectsAPI.updateProject({
                                    projectId: dashboardStore.currentProject.id,
                                    machineTranslationEnabled: values.machineTranslationEnabled,
                                    autoTranslateNewKeys: values.autoTranslateNewKeys,
                                    autoTranslateNewLanguages: values.autoTranslateNewLanguages
                                });
                                message.success("Settings updated.");
                            } catch (error) {
                                console.error(error);
                                message.error("Failed to update machine translation settings.");
                            }
                            setSettingsSubmitting(false);
                        }}
                        style={{ maxWidth: "100%", marginTop: 24, display: "flex", flexDirection: "column" }}
                        initialValues={{
                            machineTranslationEnabled:
                                dashboardStore.currentProject.attributes.machine_translation_enabled,
                            autoTranslateNewKeys: dashboardStore.currentProject.attributes.auto_translate_new_keys,
                            autoTranslateNewLanguages:
                                dashboardStore.currentProject.attributes.auto_translate_new_languages
                        }}
                    >
                        <Form.Item noStyle shouldUpdate>
                            {() => {
                                return (
                                    <>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <Form.Item
                                                name="machineTranslationEnabled"
                                                rules={[{ required: false }]}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Checkbox disabled={settingsSubmitting}>
                                                    <div style={{ display: "inline-block" }}>
                                                        <div style={{ fontWeight: "bold" }}>
                                                            Enable machine translation
                                                        </div>
                                                        <div>Enable machine translation for this project.</div>
                                                    </div>
                                                </Checkbox>
                                            </Form.Item>
                                        </div>
                                    </>
                                );
                            }}
                        </Form.Item>

                        <div style={{ marginTop: 24 }}>
                            <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => {
                                    return (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <Form.Item
                                                    name="autoTranslateNewKeys"
                                                    rules={[{ required: false }]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox
                                                        disabled={
                                                            !getFieldValue("machineTranslationEnabled") ||
                                                            settingsSubmitting
                                                        }
                                                    >
                                                        <div style={{ display: "inline-block" }}>
                                                            <div style={{ fontWeight: "bold" }}>
                                                                Automatically translate new keys
                                                            </div>
                                                            <div>
                                                                Automatically translate new keys using machine
                                                                translation.
                                                            </div>
                                                        </div>
                                                    </Checkbox>
                                                </Form.Item>
                                            </div>
                                        </>
                                    );
                                }}
                            </Form.Item>

                            <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => {
                                    return (
                                        <>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginTop: 24
                                                }}
                                            >
                                                <Form.Item
                                                    name="autoTranslateNewLanguages"
                                                    rules={[{ required: false }]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox
                                                        disabled={
                                                            !getFieldValue("machineTranslationEnabled") ||
                                                            settingsSubmitting
                                                        }
                                                    >
                                                        <div style={{ display: "inline-block" }}>
                                                            <div style={{ fontWeight: "bold" }}>
                                                                Automatically translate new languages
                                                            </div>
                                                            <div>
                                                                When you add a new language all keys are automatically
                                                                translated.
                                                            </div>
                                                        </div>
                                                    </Checkbox>
                                                </Form.Item>
                                            </div>
                                        </>
                                    );
                                }}
                            </Form.Item>
                        </div>

                        <Button
                            form="machineTranslationSettingsForm"
                            type="primary"
                            htmlType="submit"
                            style={{ alignSelf: "flex-end", marginTop: 24 }}
                            loading={settingsSubmitting}
                        >
                            Save
                        </Button>
                    </Form>
                </LayoutWithSidebarContentWrapperInner>
            </LayoutWithSidebarContentWrapper>
        </LayoutWithSidebar>
    );
}
