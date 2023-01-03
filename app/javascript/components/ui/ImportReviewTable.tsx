import { Button, message, Modal, Popconfirm, Table, Tag } from "antd";
import * as React from "react";
import { ImportsAPI } from "../api/v1/ImportsAPI";
import useImportReview from "../hooks/useImportReview";
import useLanguages from "../hooks/useLanguages";
import { ImportFilesTable } from "./ImportFilesTable";
import { LanguageNameWithFlag } from "./LanguageNameWithFlag";

function PreviewItem(props: { children: React.ReactNode }) {
    return (
        <div
            style={{
                marginBottom: 4
            }}
        >
            {props.children}
        </div>
    );
}

function PreviewItemHeader(props: { children: React.ReactNode }) {
    return (
        <div
            style={{
                fontSize: 12,
                fontWeight: "bold",
                marginBottom: 4,
                color: "var(--color-passive)"
            }}
        >
            {props.children}
        </div>
    );
}

function Preview(props: {
    old: {
        other: string;
        zero: string;
        one: string;
        two: string;
        few: string;
        many: string;
        description: string;
    };
    new: {
        other: string;
        zero: string;
        one: string;
        two: string;
        few: string;
        many: string;
        description: string;
    };
    dataSource: "old" | "new";
}) {
    return (
        <>
            {props.old?.other !== props.new.other && (
                <>
                    <PreviewItemHeader>Other</PreviewItemHeader>
                    <PreviewItem>
                        {props[props.dataSource]?.other || (
                            <span style={{ color: "var(--color-passive)" }}>no content</span>
                        )}
                    </PreviewItem>
                </>
            )}
            {props.old?.zero !== props.new.zero && (
                <>
                    <PreviewItemHeader>Zero</PreviewItemHeader>
                    <PreviewItem>{props[props.dataSource]?.zero}</PreviewItem>{" "}
                </>
            )}
            {props.old?.one !== props.new.one && (
                <>
                    <PreviewItemHeader>One</PreviewItemHeader>
                    <PreviewItem>{props[props.dataSource]?.one}</PreviewItem>{" "}
                </>
            )}
            {props.old?.two !== props.new.two && (
                <>
                    <PreviewItemHeader>Two</PreviewItemHeader>
                    <PreviewItem>{props[props.dataSource]?.two}</PreviewItem>{" "}
                </>
            )}
            {props.old?.few !== props.new.few && (
                <>
                    <PreviewItemHeader>Few</PreviewItemHeader>
                    <PreviewItem>{props[props.dataSource]?.few}</PreviewItem>{" "}
                </>
            )}
            {props.old?.many !== props.new.many && (
                <>
                    <PreviewItemHeader>Many</PreviewItemHeader>
                    <PreviewItem>{props[props.dataSource]?.many}</PreviewItem>{" "}
                </>
            )}
        </>
    );
}

export function ImportReviewTable(props: {
    projectId: string;
    importId: string;
    tableReloader?: number;
    style?: React.CSSProperties;
    onImport(): void;
}) {
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    const { getLanguageForId, getCountryCodeForLanguage } = useLanguages(props.projectId, {
        showAll: true
    });

    const { importReviewResponse, importReviewLoading, importReviewForceReload } = useImportReview({
        projectId: props.projectId,
        importId: props.importId
    });

    React.useEffect(() => {
        (async () => {
            await importReviewForceReload();
        })();
    }, [props.tableReloader]);

    function getRows() {
        if (!importReviewResponse?.new_translations) {
            return [];
        }

        const rows = [];
        Object.keys(importReviewResponse.new_translations).forEach((languageId) => {
            Object.keys(importReviewResponse.new_translations[languageId]).forEach((keyName) => {
                const translationObject = importReviewResponse.new_translations[languageId][keyName];
                const language = getLanguageForId(languageId);
                const countryCode = getCountryCodeForLanguage(language);

                rows.push({
                    key: `${languageId}-${keyName}`,
                    id: `${languageId}-${keyName}`,
                    name: keyName,
                    language: (
                        <LanguageNameWithFlag
                            languageName={language?.attributes.name}
                            countryCode={countryCode?.attributes.code}
                        />
                    ),
                    old: <Preview old={translationObject.old} new={translationObject.new} dataSource="old" />,
                    new: <Preview old={translationObject.old} new={translationObject.new} dataSource="new" />,
                    status: translationObject.new_translation ? (
                        <Tag color="green">New</Tag>
                    ) : (
                        <Tag color="orange">Update</Tag>
                    )
                });
            });
        });

        return rows;
    }

    function getColumns() {
        const columns: { title: React.ReactNode; dataIndex: string; key?: string; width?: number }[] = [
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 64
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Language",
                dataIndex: "language",
                key: "language"
            },
            {
                title: "Current",
                dataIndex: "old",
                key: "old"
            },
            {
                title: "New",
                dataIndex: "new",
                key: "new"
            }
            // {
            //     title: "",
            //     dataIndex: "controls",
            //     width: 50
            // }
        ];

        return columns;
    }

    async function onDelete() {
        setIsDeleting(true);
        Modal.confirm({
            title: "Do you really want to delete the selected imports?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: isDeleting,
            onOk: async () => {
                try {
                    const response = await ImportsAPI.delete({
                        projectId: props.projectId,
                        importIds: selectedRowKeys as string[]
                    });
                    if (response.errors) {
                        message.error("Failed to delete import.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to delete import.");
                    console.error(error);
                }

                await importReviewForceReload();

                setIsDeleting(false);
                setSelectedRowKeys([]);
            },
            onCancel: () => {
                setIsDeleting(false);
            }
        });
    }

    const rows = getRows();

    return (
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, ...props.style }}>
            <div style={{ display: "flex", marginBottom: 24 }}>
                <Button danger onClick={onDelete} disabled={selectedRowKeys.length === 0} loading={isDeleting}>
                    Delete selected
                </Button>
            </div>
            <Table
                rowSelection={{
                    onChange: (newSelectedRowKeys) => {
                        setSelectedRowKeys(newSelectedRowKeys);
                    }
                }}
                dataSource={rows}
                columns={getColumns()}
                bordered
                loading={importReviewLoading}
                pagination={false}
            />
            <Popconfirm
                title="Are you sure you want to import the new translations?"
                okText="Import"
                okButtonProps={
                    {
                        "data-id": "import-review-import-button-confirm"
                    } as any
                }
                onConfirm={async () => {
                    try {
                        const response = await ImportsAPI.import({
                            projectId: props.projectId,
                            importId: props.importId
                        });
                        if (response.error) {
                            message.error(`Failed to start import: ${response.message}`);
                        } else {
                            props.onImport();
                        }
                    } catch (error) {
                        console.error(error);
                        message.error("Failed to start import.");
                    }
                }}
            >
                <Button
                    type="primary"
                    style={{ alignSelf: "flex-end", marginTop: 24 }}
                    data-id="import-review-import-button"
                >
                    Import translations
                </Button>
            </Popconfirm>
        </div>
    );
}
