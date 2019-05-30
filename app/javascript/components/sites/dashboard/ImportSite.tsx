import { Alert, Button, Icon, Layout, message, Select } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link, RouteComponentProps } from "react-router-dom";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
const { Header, Content, Footer, Sider } = Layout;
import Dropzone from "react-dropzone";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import FlagIcon from "../../ui/FlagIcons";
import { LoadingOverlay } from "../../ui/LoadingOverlay";
import { Styles } from "../../ui/Styles";
import { makeCancelable } from "../../utilities/Promise";

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  files: any[];
  selectedLanguageId: string;
  languages: any[];
  languagesResponse: any;
  loading: boolean;
}

class ImportSite extends React.Component<IProps, IState> {
  getLanguagesPromise: any;
  dropzoneRef: any;
  languageSelect: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
      files: [],
      selectedLanguageId: null,
      languages: [],
      languagesResponse: null,
      loading: false
    };
  }

  async componentDidMount() {
    try {
      this.getLanguagesPromise = makeCancelable(LanguagesAPI.getLanguages(this.props.match.params.projectId));

      const responseLanguages = await this.getLanguagesPromise.promise;

      this.setState({
        languages: responseLanguages.data,
        languagesResponse: responseLanguages
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  componentWillUnmount() {
    if (this.getLanguagesPromise !== null) { this.getLanguagesPromise.cancel(); }
  }

  onDrop = (files: any) => {
    this.setState({
      files: files
    });
  }

  upload = async () => {
    this.setState({ loading: true });

    const response = await ProjectsAPI.import(
      this.props.match.params.projectId,
      this.state.selectedLanguageId,
      this.state.files[0]
    );

    if (!response.errors) {
      message.success("Successfully imported the translations.");
      this.setState({
        files: [],
        selectedLanguageId: null
      });
    }

    this.setState({ loading: false });
  }

  render(): JSX.Element {
    return (
      <>
        <Layout style={{ padding: "0 24px 24px", maxWidth: 500, margin: "0", width: "100%" }}>
          <Breadcrumbs breadcrumbName="import" />
          <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
            <h1>Import</h1>
            <p>You can select a file to import for a given language.</p>
            {this.state.languagesResponse && this.state.languages.length === 0 &&
              <>
                <Alert
                  type="info"
                  showIcon
                  message={<>No languages</>}
                  description={
                    <>
                      <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
                        You must first <Link to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", this.props.match.params.projectId)}>
                          create a language </Link> before you can import keys for it.
                      </p>
                    </>
                  }
                />
              </>
            }
            {this.state.languages.length > 0 &&
              <>
                <div style={{ display: "flex" }}>
                  <p style={{ display: "inline-block", marginRight: 8, flexShrink: 0 }}>Select a language: </p>
                  <Select
                    style={{ flexGrow: 1 }}
                    onChange={(selectedValue: string) => {
                      this.setState({
                        selectedLanguageId: selectedValue
                      });
                    }}
                    ref={(node) => { this.languageSelect = node; }}
                    value={this.state.selectedLanguageId}
                  >
                    {this.state.languages.map((language, index) => {
                      const countryCode = APIUtils.getIncludedObject(language.relationships.country_code.data, this.state.languagesResponse.included);

                      return <Select.Option value={language.id} key={language.attributes.name}>
                        {countryCode && <span style={{ marginRight: 8 }}>
                          <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                        </span>}
                        {language.attributes.name}
                      </Select.Option>;
                    })}
                  </Select>
                </div>
                <Dropzone
                  onDrop={this.onDrop}
                  ref={(node) => { this.dropzoneRef = node; }}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => {
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
                          background: "#fcfcfc",
                          marginTop: 10
                        }}
                      >
                        {this.state.files.length > 0 ?
                          <p style={{ margin: 0, display: "flex", alignItems: "center" }}>
                            <Icon
                              type="file-text"
                              style={{
                                fontSize: 26,
                                color: "#aaa",
                                marginRight: 10
                              }}
                            />
                            {this.state.files[0].name}
                          </p> :
                          <p style={{ margin: 0 }}>Drop a file here or click to upload a file.</p>
                        }
                        {/* tslint:disable-next-line:react-a11y-input-elements */}
                        <input {...getInputProps()} />
                      </div>
                    );
                  }}
                </Dropzone>
                <div style={{ marginTop: 10, justifyContent: "flex-end", display: "flex" }}>
                  <Button
                    disabled={this.state.files.length === 0}
                    onClick={() => { this.setState({ files: [] }); }}
                    style={{ marginRight: 10 }}
                  >
                    Remove file
                  </Button>
                  <Button type="primary" disabled={this.state.files.length === 0} onClick={this.upload}>
                    Import file
                </Button>
                </div>
              </>
            }
          </Content>
        </Layout>

        <LoadingOverlay isVisible={this.state.loading} loadingText={"Importing data..."} />
      </>
    );
  }
}

export { ImportSite };
