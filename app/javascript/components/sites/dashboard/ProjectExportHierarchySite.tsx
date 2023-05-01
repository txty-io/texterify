import { Skeleton, Tree } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { CustomAlert } from "../../ui/CustomAlert";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import FlagIcon from "../../ui/FlagIcons";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { ExportSidebar } from "./ExportSidebar";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    treeData: any[];
    expandedKeys: any[];
    responseLanguages: any;
    responseLanguagesLoading: boolean;
}

@observer
class ProjectExportHierarchySite extends React.Component<IProps> {
    state: IState = {
        treeData: [],
        expandedKeys: [],
        responseLanguagesLoading: true,
        responseLanguages: null
    };

    async componentDidMount() {
        this.setState({ responseLanguagesLoading: true });

        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, {
                showAll: true
            });
            const treeData = this.buildTreeData(responseLanguages.data);

            const keys = [];
            const loop = (data) => {
                return data.map((item) => {
                    keys.push(item.id);
                    if (item.children && item.children.length) {
                        loop(item.children);
                    }
                });
            };
            loop(treeData);

            this.setState({
                treeData: treeData,
                expandedKeys: keys,
                responseLanguages
            });
        } catch (e) {
            console.error(e);
        }

        this.setState({ responseLanguagesLoading: false });
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
    };

    onDrop = async (info: any) => {
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split("-");
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        let newParent = null;

        const data = [...this.state.treeData];
        let dragObj;

        // Find the dragged element in the data and remove it.
        this.findElementForKey(
            data,
            dragKey,
            (item, index, arr) => {
                arr.splice(index, 1);
                dragObj = item;
            },
            null
        );

        if (info.dropToGap) {
            // The element has been dropped to a gap.
            let ar;
            let i: number;
            this.findElementForKey(
                data,
                dropKey,
                (_item, index: number, arr, parent) => {
                    ar = arr;
                    i = index;
                    newParent = parent;
                },
                null
            );

            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        } else {
            // In case the element is a children of some other language
            // add it as a child.
            this.findElementForKey(
                data,
                dropKey,
                (item) => {
                    item.children = item.children || [];
                    item.children.push(dragObj);
                    newParent = item;
                },
                null
            );
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
    };

    buildTreeData = (data: any[]) => {
        return data.reduce((acc: any, item: any) => {
            if (item.relationships.parent.data === null) {
                acc.push(this.buildTreeDataHelper(data, item));
            }

            return acc;
        }, []);
    };

    buildTreeDataHelper = (data: any[], parent: any) => {
        const children = data.reduce((acc: any, item: any) => {
            if (item.relationships.parent.data && item.relationships.parent.data.id === parent.id) {
                acc.push(this.buildTreeDataHelper(data, item));
            }

            return acc;
        }, []);

        parent.children = children;

        return parent;
    };

    loop = (data: any) => {
        return data.map((item) => {
            const countryCode = APIUtils.getIncludedObject(
                item.relationships.country_code.data,
                this.state.responseLanguages.included
            );

            return (
                <Tree.TreeNode
                    key={item.id}
                    title={item.attributes.name}
                    icon={
                        countryCode ? (
                            <span style={{ marginRight: 8 }}>
                                <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                            </span>
                        ) : (
                            ""
                        )
                    }
                >
                    {item.children && item.children.length && this.loop(item.children)}
                </Tree.TreeNode>
            );
        });
    };

    render() {
        return (
            <LayoutWithSubSidebar>
                <ExportSidebar projectId={this.props.match.params.projectId} />

                <LayoutWithSubSidebarInner>
                    <Breadcrumbs breadcrumbName="projectExportHiearchy" />
                    <LayoutWithSubSidebarInnerContent>
                        <h1>Hierarchy</h1>
                        <p>
                            Build a hierarchy by making use of drag and drop to specify which translations should be
                            used when there is no translation for the key available. If a translation is not found the
                            hierarchy is traversed upwards until a translation has been found or the end is reached.
                        </p>

                        {this.state.responseLanguagesLoading && (
                            <>
                                <Skeleton />
                                <Skeleton />
                            </>
                        )}

                        {!dashboardStore.featureEnabled("FEATURE_EXPORT_HIERARCHY") && (
                            <FeatureNotAvailable feature="FEATURE_EXPORT_HIERARCHY" style={{ marginBottom: 16 }} />
                        )}

                        {this.state.responseLanguages && this.state.responseLanguages.data.length < 2 && (
                            <CustomAlert
                                type="info"
                                title="Create more languages"
                                description={
                                    <>
                                        You need at least 2 languages to build a hierarchy.
                                        <br />
                                        <Link
                                            to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                ":projectId",
                                                this.props.match.params.projectId
                                            )}
                                        >
                                            Add another language
                                        </Link>
                                    </>
                                }
                            />
                        )}

                        {this.state.responseLanguages && this.state.responseLanguages.data.length > 1 && (
                            <Tree
                                draggable
                                onDrop={this.onDrop}
                                expandedKeys={this.state.expandedKeys}
                                showIcon
                                disabled={!dashboardStore.featureEnabled("FEATURE_EXPORT_HIERARCHY")}
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
                                {this.loop(this.state.treeData)}
                            </Tree>
                        )}
                    </LayoutWithSubSidebarInnerContent>
                </LayoutWithSubSidebarInner>
            </LayoutWithSubSidebar>
        );
    }
}

export { ProjectExportHierarchySite };
