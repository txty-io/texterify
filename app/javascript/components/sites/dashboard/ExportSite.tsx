import { Alert, Button, Icon, Layout, message, Select, Tree } from "antd";
import * as moment from "moment";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import FlagIcon from "../../ui/FlagIcons";
import { Styles } from "../../ui/Styles";

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  languagesLoaded: boolean;
  languages: any[];
  languagesIncluded: any[];
  treeData: any[];
  expandedKeys: any[];
  selectedFormat: string;
}

class ExportSite extends React.Component<IProps, IState> {
  state: IState = {
    languages: [],
    languagesIncluded: [],
    treeData: [],
    expandedKeys: [],
    languagesLoaded: false,
    selectedFormat: ""
  };

  async componentDidMount() {
    try {
      const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);
      const treeData = this.buildTreeData(responseLanguages.data);

      const keys = [];
      const loop = (data) => data.map((item) => {
        keys.push(item.id);
        if (item.children && item.children.length) {
          loop(item.children);
        }
      });
      loop(treeData);

      this.setState({
        languagesLoaded: true,
        languages: responseLanguages.data,
        languagesIncluded: responseLanguages.included,
        treeData: treeData,
        expandedKeys: keys
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  findElementForKey = (data: any[], key: string, callback: any, parent: any): any => {
    data.forEach((item, index, arr) => {
      if (item.id === key) {
        return callback(item, index, arr, parent);
      }

      if (item.children) {
        return this.findElementForKey(item.children, key, callback, item);
      }
    });
  }

  onDrop = async (info: any) => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split("-");
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    let newParent = null;

    const data = [...this.state.treeData];
    let dragObj;

    // Find the dragged element in the data and remove it.
    this.findElementForKey(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    }, null);

    if (info.dropToGap) {
      // The element has been dropped to a gap.
      let ar;
      let i: number;
      this.findElementForKey(data, dropKey, (item, index: number, arr, parent) => {
        ar = arr;
        i = index;
        newParent = parent;
      }, null);

      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    } else {
      // In case the element is a children of some other language
      // add it as a child.
      this.findElementForKey(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.push(dragObj);
        newParent = item;
      }, null);
    }

    const updateLanguageParentPromise = await LanguagesAPI.updateLanguageParent(
      this.props.match.params.projectId,
      dragKey,
      newParent ? newParent.id : null
    );
    if (updateLanguageParentPromise.errors) {
      return;
    }

    // Set the new data.
    this.setState({
      treeData: data
    });
  }

  buildTreeData = (data: any[]) => {
    return data.reduce((acc: any, item: any) => {
      if (item.relationships.parent.data === null) {
        acc.push(this.buildTreeDataHelper(data, item));
      }

      return acc;
    }, []);
  }

  buildTreeDataHelper = (data: any[], parent: any) => {
    const children = data.reduce((acc: any, item: any) => {
      if (item.relationships.parent.data && item.relationships.parent.data.id === parent.id) {
        acc.push(this.buildTreeDataHelper(data, item));
      }

      return acc;
    }, []);

    parent.children = children;

    return parent;
  }

  // tslint:disable-next-line:max-func-body-length
  render() {
    const loop = (data) => data.map((item) => {
      const countryCode = APIUtils.getIncludedObject(
        item.relationships.country_code.data,
        this.state.languagesIncluded
      );

      return (
        <Tree.TreeNode
          key={item.id}
          title={item.attributes.name}
          icon={countryCode ?
            <span style={{ marginRight: 8 }}>
              <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
            </span>
            : ""
          }
        >
          {item.children && item.children.length && loop(item.children)}
        </Tree.TreeNode>
      );
    });

    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
        <Breadcrumbs breadcrumbName="export" />
        <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 800 }}>
          <h1>Export</h1>
          {this.state.languagesLoaded && this.state.languages.length === 0 &&
            <>
              <Alert
                type="info"
                showIcon
                message={<>No languages.</>}
                description={
                  <>
                    <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
                      You must first <Link to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", this.props.match.params.projectId)}>
                        create a language </Link> before you can export your keys.
                      </p>
                  </>
                }
              />
            </>
          }
          {this.state.languages.length > 0 &&
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", flexDirection: "column", width: "40%", marginRight: 16 }}>
                <h3>Export format</h3>
                <Select
                  placeholder="Select a format"
                  style={{ width: "100%" }}
                  onChange={(value: string) => {
                    this.setState({ selectedFormat: value });
                  }}
                >
                  <Select.Option value="json">JSON</Select.Option>
                  <Select.Option value="typescript">JSON (TypeScript)</Select.Option>
                  <Select.Option value="android">
                    <Icon type="android" style={{ marginRight: 8 }} />
                    Android .xml
                  </Select.Option>
                  <Select.Option value="ios">
                    <Icon type="apple" style={{ marginRight: 8 }} />
                    iOS .strings
                  </Select.Option>
                  <Select.Option value="rails">Rails .yml</Select.Option>
                </Select>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="primary"
                    onClick={async () => {
                      const response = await ProjectsAPI.export(
                        this.props.match.params.projectId,
                        `${dashboardStore.currentProject.attributes.name}-${moment().format("DD-MM-YYYY")}-${(new Date()).getTime()}`,
                        this.state.selectedFormat
                      );

                      if (response.status !== 200) {
                        message.error("An error occured during the export.");
                      }
                    }}
                    icon="download"
                  >
                    Export
                  </Button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", width: "60%", marginLeft: 16 }}>
                <h3>Export hierarchy</h3>
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 3,
                    background: "#fcfcfc",
                    padding: 16
                  }}
                >
                  <p>You can drag your languages around and build a hierarchy to specify which translations should be used when there is no translation in the language present.</p>
                  <Tree
                    draggable
                    onDrop={this.onDrop}
                    expandedKeys={this.state.expandedKeys}
                    showIcon
                    onExpand={(expandedKeys: string[], options: { expanded?: boolean; node: any }) => {
                      if (options.expanded) {
                        expandedKeys.push(options.node.props.eventKey);
                        this.setState({
                          expandedKeys: expandedKeys
                        });
                      } else {
                        this.setState({
                          expandedKeys: this.state.expandedKeys.filter((key) => {
                            return key !== options.node.props.eventKey;
                          })
                        });
                      }
                    }}
                  >
                    {loop(this.state.treeData)}
                  </Tree>
                </div>
              </div>
            </div>
          }
        </Layout.Content>
      </Layout>
    );
  }
}

export { ExportSite };
