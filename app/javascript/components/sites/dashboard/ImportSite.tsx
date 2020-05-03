import { FileTextOutlined } from "@ant-design/icons";
import { Alert, Button, Layout, message, Select } from "antd";
import * as React from "react";
import Dropzone from "react-dropzone";
import { Link, RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import FlagIcon from "../../ui/FlagIcons";
import { LoadingOverlay } from "../../ui/LoadingOverlay";
import { Styles } from "../../ui/Styles";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    files: any[];
    selectedLanguageId: string;
    selectedExportConfigId: string;
    languages: any[];
    languagesResponse: any;
    loading: boolean;
    responseExportConfigs: any;
}

class ImportSite extends React.Component<IProps, IState> {
    dropzoneRef: any;

    state: IState = {
        files: [],
        selectedLanguageId: null,
        selectedExportConfigId: null,
        languages: [],
        languagesResponse: null,
        loading: false,
        responseExportConfigs: null
    };

    async componentDidMount() {
        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);
            const responseExportConfigs = await ExportConfigsAPI.getExportConfigs({
                projectId: this.props.match.params.projectId
            });

            this.setState({
                languages: responseLanguages.data,
                languagesResponse: responseLanguages,
                responseExportConfigs
            });
        } catch (e) {
            console.error(e);
        }
    }

    onDrop = (files: any) => {
        this.setState({
            files: files
        });
    };

    upload = async () => {
        this.setState({ loading: true });

        const response = await ProjectsAPI.import({
            projectId: this.props.match.params.projectId,
            languageId: this.state.selectedLanguageId,
            exportConfigId: this.state.selectedExportConfigId,
            file: this.state.files[0]
        });

        if (!response.errors && response.ok) {
            message.success("Successfully imported translations.");
            this.setState({
                files: [],
                selectedLanguageId: null
            });
        } else {
            message.error("Failed to import translations.");
        }

        this.setState({ loading: false });
    };

    getExportConfigSelect = () => {
        return (
            <Select
                style={{ flexGrow: 1 }}
                onChange={(selectedValue: string) => {
                    this.setState({
                        selectedExportConfigId: selectedValue
                    });
                }}
                value={this.state.selectedExportConfigId}
            >
                {this.state.responseExportConfigs.data.map((exportConfig) => {
                    return (
                        <Select.Option value={exportConfig.id} key={exportConfig.id}>
                            {exportConfig.attributes.name}
                        </Select.Option>
                    );
                })}
            </Select>
        );
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="import" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 480 }}>
                        <h1>Import</h1>
                        <p>Select a file to import for a given language and optionally an export config.</p>
                        {this.state.languagesResponse && this.state.languages.length === 0 && (
                            <>
                                <Alert
                                    type="info"
                                    showIcon
                                    message="No language"
                                    description={
                                        <>
                                            <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
                                                Create a{" "}
                                                <Link
                                                    to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                        ":projectId",
                                                        this.props.match.params.projectId
                                                    )}
                                                >
                                                    language{" "}
                                                </Link>{" "}
                                                to import your keys.
                                            </p>
                                        </>
                                    }
                                />
                            </>
                        )}
                        {this.state.languages.length > 0 && (
                            <>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span style={{ marginRight: 8 }}>Select a language:</span>
                                    <Select
                                        style={{ flexGrow: 1 }}
                                        onChange={(selectedValue: string) => {
                                            this.setState({
                                                selectedLanguageId: selectedValue
                                            });
                                        }}
                                        value={this.state.selectedLanguageId}
                                    >
                                        {this.state.languages.map((language) => {
                                            const countryCode = APIUtils.getIncludedObject(
                                                language.relationships.country_code.data,
                                                this.state.languagesResponse.included
                                            );

                                            return (
                                                <Select.Option value={language.id} key={language.attributes.name}>
                                                    {countryCode && (
                                                        <span style={{ marginRight: 8 }}>
                                                            <FlagIcon
                                                                code={countryCode.attributes.code.toLowerCase()}
                                                            />
                                                        </span>
                                                    )}
                                                    {language.attributes.name}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </div>
                                {this.state.responseExportConfigs && this.state.responseExportConfigs.data.length > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                                        <span style={{ marginRight: 8 }}>Select an export config:</span>
                                        {this.getExportConfigSelect()}
                                    </div>
                                )}
                                <Dropzone
                                    onDrop={this.onDrop}
                                    ref={(node) => {
                                        this.dropzoneRef = node;
                                    }}
                                    accept=".json"
                                >
                                    {({ getRootProps, getInputProps }) => {
                                        return (
                                            <div
                                                {...getRootProps()}
                                                style={{
                                                    width: "100%",
                                                    height: 125,
                                                    border: "1px dashed #bbb",
                                                    borderRadius: 3,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    cursor: "pointer",
                                                    background: "#fff",
                                                    marginTop: 10
                                                }}
                                            >
                                                {this.state.files.length > 0 ? (
                                                    <p style={{ margin: 0, display: "flex", alignItems: "center" }}>
                                                        <FileTextOutlined
                                                            style={{
                                                                fontSize: 26,
                                                                color: "#aaa",
                                                                marginRight: 10
                                                            }}
                                                        />
                                                        {this.state.files[0].name}
                                                    </p>
                                                ) : (
                                                    <p style={{ margin: 0 }}>
                                                        Drop a <b>.json</b> file here or click to upload one.
                                                    </p>
                                                )}
                                                <input {...getInputProps()} accept=".json" />
                                            </div>
                                        );
                                    }}
                                </Dropzone>
                                <div style={{ marginTop: 10, justifyContent: "flex-end", display: "flex" }}>
                                    <Button
                                        disabled={this.state.files.length === 0}
                                        onClick={() => {
                                            this.setState({ files: [] });
                                        }}
                                        style={{ marginRight: 10 }}
                                    >
                                        Remove file
                                    </Button>
                                    <Button
                                        type="primary"
                                        disabled={this.state.files.length === 0 || !this.state.selectedLanguageId}
                                        onClick={this.upload}
                                    >
                                        Import file
                                    </Button>
                                </div>
                            </>
                        )}
                    </Layout.Content>
                </Layout>

                <LoadingOverlay isVisible={this.state.loading} loadingText={"Importing data..."} />
            </>
        );
    }
}

export { ImportSite };
