import { FileTextOutlined } from "@ant-design/icons";
import { Alert, Card, Layout, message, Statistic } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import Dropzone from "react-dropzone";
import { ILicense, LicensesAPI } from "../../../api/v1/LicensesAPI";
import { MESSAGE_DURATION_IMPORTANT } from "../../../configs/MessageDurations";
import { DropZoneWrapper } from "../../../ui/DropZoneWrapper";
import { Loading } from "../../../ui/Loading";
import { PrimaryButton } from "../../../ui/PrimaryButton";

const TEXTERIFY_LICENSE_FILE_NAME = "texterify.texterify-license";
const TEXTERIFY_LICENSE_FILE_ACCEPT = ".texterify-license";

export const InstanceLicensesSite = observer(() => {
    const [licenses, setLicenses] = React.useState<ILicense[]>([]);
    const [files, setFiles] = React.useState<File[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    async function loadLicenses() {
        try {
            const getLicensesResponse = await LicensesAPI.getLicenses();
            setLicenses(getLicensesResponse.data);
        } catch (e) {
            console.error(e);
        }
    }

    async function onInit() {
        setLoading(true);
        await loadLicenses();
        setLoading(false);
    }

    React.useEffect(() => {
        onInit();
    }, []);

    function renderLicense(license: ILicense, disabled?: boolean) {
        return (
            <div key={license.id} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex" }}>
                    <Statistic
                        className={disabled ? "disabled" : undefined}
                        title="Name"
                        value={license.attributes.licensee.name}
                        style={{ marginRight: 40 }}
                    />
                    <Statistic
                        className={disabled ? "disabled" : undefined}
                        title="E-Mail"
                        value={license.attributes.licensee.email}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                    <Statistic
                        className={disabled ? "disabled" : undefined}
                        title="Starts at"
                        value={license.attributes.starts_at}
                    />
                    <Statistic
                        className={disabled ? "disabled" : undefined}
                        title="Expires at"
                        value={license.attributes.expires_at}
                    />
                    <Statistic
                        className={disabled ? "disabled" : undefined}
                        title="Max active users"
                        value={license.attributes.restrictions?.active_users_count}
                    />
                </div>
                {license.attributes.expired && (
                    <Alert
                        showIcon
                        message="This license has expired."
                        type="error"
                        style={{ marginTop: 24, maxWidth: "100%" }}
                    />
                )}
            </div>
        );
    }

    function onDrop(newFiles: File[]) {
        setFiles(newFiles);
    }

    async function uploadLicense() {
        setLoading(true);
        try {
            const response: any = await LicensesAPI.uploadLicense({ file: files[0] });
            if (response.error) {
                if (response.message === "INVALID_LICENSE_FILE") {
                    message.error(
                        "The uploaded license is invalid. Please contact support if you are having troubles uploading your license file.",
                        MESSAGE_DURATION_IMPORTANT
                    );
                } else {
                    message.error("An error occurred while uploading the license.");
                }

                setFiles([]);
            } else {
                message.success("Successfully uploaded license file.");
                setFiles([]);
                await loadLicenses();
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%", maxWidth: 800 }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <h1>Licenses</h1>
                <Dropzone
                    onDrop={(acceptedFiles) => {
                        onDrop(acceptedFiles);
                    }}
                    accept={[TEXTERIFY_LICENSE_FILE_ACCEPT]}
                >
                    {({ getRootProps, getInputProps }) => {
                        return (
                            <DropZoneWrapper {...getRootProps()}>
                                {files.length > 0 ? (
                                    <p style={{ margin: 0, display: "flex", alignItems: "center" }}>
                                        <FileTextOutlined
                                            style={{
                                                fontSize: 26,
                                                marginRight: 10
                                            }}
                                        />
                                        {files[0].name}
                                    </p>
                                ) : (
                                    <p style={{ margin: 0 }}>
                                        Drop your <b>{TEXTERIFY_LICENSE_FILE_NAME}</b> file here or click to upload one.
                                    </p>
                                )}
                                <input {...getInputProps()} accept={TEXTERIFY_LICENSE_FILE_ACCEPT} />
                            </DropZoneWrapper>
                        );
                    }}
                </Dropzone>
                <PrimaryButton
                    onClick={() => {
                        uploadLicense();
                    }}
                    data-id="upload-license-button"
                    disabled={files.length === 0}
                    style={{ marginTop: 16, marginBottom: 40 }}
                >
                    Upload license
                </PrimaryButton>

                {licenses?.length > 0 && (
                    <>
                        <h3>Active license</h3>
                        <Card>
                            {licenses?.slice(0, 1).map((license) => {
                                return renderLicense(license);
                            })}
                        </Card>
                    </>
                )}

                {licenses?.length > 1 && (
                    <>
                        <h3 style={{ marginTop: 40 }}>Old licenses</h3>

                        {licenses?.slice(1).map((license) => {
                            return (
                                <Card key={license.id} style={{ marginBottom: 16 }}>
                                    {renderLicense(license, true)}
                                </Card>
                            );
                        })}
                    </>
                )}
            </Layout.Content>
        </Layout>
    );
});
