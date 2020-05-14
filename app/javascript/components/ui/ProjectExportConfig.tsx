import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Tag, Tree } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { observer } from "mobx-react";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { FileFormatOptions } from "../configs/FileFormatOptions";

interface IProps {
    exportConfig: any;
    languagesResponse: any;
    style?: React.CSSProperties;
    onEdit?(exportConfig: any): void;
    onDelete?(exportConfig: any): void;
}

interface IState {
    visible: boolean;
}

@observer
class ProjectExportConfig extends React.Component<IProps, IState> {
    state: IState = {
        visible: false
    };

    prettifyFilePath = (path: string) => {
        const splitted = path.split(/({languageCode})|({countryCode})/).filter((splittedPathElement) => {
            return splittedPathElement;
        });

        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                {splitted.map((split, index) => {
                    if (split === "{languageCode}") {
                        return (
                            <Tag color="geekblue" key={index} style={{ margin: "0 2px 0 0" }}>
                                {"{languageCode}"}
                            </Tag>
                        );
                    } else if (split === "{countryCode}") {
                        return (
                            <Tag color="geekblue" key={index} style={{ margin: "0 2px 0 0" }}>
                                {"{countryCode}"}
                            </Tag>
                        );
                    } else {
                        return (
                            <Tag color="#fff" key={index} style={{ margin: "0 2px 0 0", padding: 0, color: "#000" }}>
                                {split}
                            </Tag>
                        );
                    }
                })}
            </div>
        );
    };

    getFileFormatName = (fileFormat: string) => {
        return FileFormatOptions.find((fileFormatOption) => {
            return fileFormatOption.value === fileFormat;
        }).text;
    };

    resolveTree = (treeData: any, splittedPath: string[], level: number) => {
        const currentPathElement = splittedPath[level];
        const isLast = splittedPath.length - 1 === level;

        if (treeData[currentPathElement]) {
            if (isLast) {
                let number = 1;
                let newName = `${currentPathElement}${number}`;

                while (treeData[newName]) {
                    number++;
                    newName = `${currentPathElement}${number}`;
                }

                treeData[newName] = newName;
            }
        } else {
            if (isLast) {
                treeData[currentPathElement] = currentPathElement;
            } else {
                treeData[currentPathElement] = {};
            }
        }

        if (!isLast) {
            this.resolveTree(treeData[currentPathElement], splittedPath, level + 1);
        }
    };

    getTreePreview = (defaultLanguageFilePath: string, filePath: string) => {
        const resolvedPaths =
            this.props.languagesResponse &&
            this.props.languagesResponse.data.map((language) => {
                const countryCode = APIUtils.getIncludedObject(
                    language.relationships.country_code.data,
                    this.props.languagesResponse.included
                );
                const languageCode = APIUtils.getIncludedObject(
                    language.relationships.language_code.data,
                    this.props.languagesResponse.included
                );

                let title;
                if (language.attributes.is_default && defaultLanguageFilePath) {
                    title = defaultLanguageFilePath;
                } else {
                    title = filePath;
                }

                if (countryCode) {
                    title = title.split("{countryCode}").join(countryCode.attributes.code);
                }

                if (languageCode) {
                    title = title.split("{languageCode}").join(languageCode.attributes.code);
                }

                return title;
            });

        const treeData = {};
        resolvedPaths.sort().forEach((path) => {
            const splittedPath = path.split("/");
            this.resolveTree(treeData, splittedPath, 0);
        });

        const buildTree = (buildTreeData, pathSoFar) => {
            return Object.keys(buildTreeData)
                .map((treeKey) => {
                    if (typeof buildTreeData[treeKey] === "string") {
                        return <Tree.TreeNode key={pathSoFar + treeKey} title={treeKey} />;
                    } else {
                        return (
                            <Tree.TreeNode key={pathSoFar + treeKey} title={treeKey}>
                                {buildTree(buildTreeData[treeKey], pathSoFar + treeKey)}
                            </Tree.TreeNode>
                        );
                    }
                })
                .filter((data) => {
                    return data !== undefined;
                });
        };

        return buildTree(treeData, "");
    };

    render() {
        return (
            <Card
                style={{ ...this.props.style }}
                actions={[
                    this.props.onEdit && (
                        <SettingOutlined
                            type="setting"
                            key="setting"
                            onClick={() => {
                                return this.props.onEdit(this.props.exportConfig);
                            }}
                        />
                    ),
                    this.props.onDelete && (
                        <DeleteOutlined
                            type="delete"
                            key="delete"
                            onClick={() => {
                                return this.props.onDelete(this.props.exportConfig);
                            }}
                        />
                    )
                ]}
            >
                <div style={{ display: "flex" }}>
                    <div>
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                            <h3>{this.props.exportConfig.attributes.name}</h3>

                            <h4 style={{ fontWeight: "bold" }}>Configuration ID:</h4>
                            <Paragraph code copyable={{ text: this.props.exportConfig.id }} style={{ margin: 0 }}>
                                {`${this.props.exportConfig.id}`}
                            </Paragraph>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div>
                                <h4 style={{ fontWeight: "bold" }}>File format:</h4>
                                {this.getFileFormatName(this.props.exportConfig.attributes.file_format)}
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <h4 style={{ fontWeight: "bold" }}>File path:</h4>
                                {this.prettifyFilePath(this.props.exportConfig.attributes.file_path)}
                            </div>

                            {this.props.exportConfig.attributes.default_language_file_path && (
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ fontWeight: "bold" }}>Default language file path:</h4>
                                    {this.prettifyFilePath(
                                        this.props.exportConfig.attributes.default_language_file_path
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                style={{ alignSelf: "flex-start", marginTop: 16 }}
                                onClick={() => {
                                    this.setState({ visible: true });
                                }}
                            >
                                Preview export
                            </Button>
                        </div>
                    </div>
                </div>

                <Drawer
                    title="Export structure preview"
                    placement="right"
                    onClose={() => {
                        this.setState({ visible: false });
                    }}
                    visible={this.state.visible}
                    width={400}
                >
                    {this.props.languagesResponse && this.props.languagesResponse.data.length > 0 && (
                        <Tree.DirectoryTree selectable={false} defaultExpandAll expandAction={false}>
                            {this.getTreePreview(
                                this.props.exportConfig.attributes.default_language_file_path,
                                this.props.exportConfig.attributes.file_path
                            )}
                        </Tree.DirectoryTree>
                    )}

                    {this.props.languagesResponse &&
                        this.props.languagesResponse.data.length === 0 &&
                        "No languages to export available."}
                </Drawer>
            </Card>
        );
    }
}

export { ProjectExportConfig };
