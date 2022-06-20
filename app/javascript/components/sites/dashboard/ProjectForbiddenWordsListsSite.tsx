import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { ForbiddenWordsListsTable } from "../../ui/ForbiddenWordsListsTable";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { ValidationSiteHeader } from "../../ui/ValidationSiteHeader";
import { ValidationsSidebar } from "../../ui/ValidationsSidebar";

type IProps = RouteComponentProps<{ projectId: string }>;

@observer
class ProjectForbiddenWordsListsSite extends React.Component<IProps> {
    render() {
        return (
            <>
                <LayoutWithSidebar>
                    <ValidationsSidebar projectId={this.props.match.params.projectId} />

                    <LayoutWithSidebarContentWrapper>
                        <Breadcrumbs breadcrumbName="projectForbiddenWords" />
                        <LayoutWithSidebarContentWrapperInner>
                            <h1>Forbidden words</h1>
                            <p>Add lists of words that should not occur in your translations.</p>

                            {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                <FeatureNotAvailable
                                    feature="FEATURE_VALIDATIONS"
                                    dataId="FEATURE_VALIDATIONS_NOT_AVAILABLE"
                                />
                            )}

                            {dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                <>
                                    <ValidationSiteHeader
                                        projectId={this.props.match.params.projectId}
                                        checkFor="validations"
                                    />

                                    <div style={{ display: "flex", marginTop: 24 }}>
                                        <ForbiddenWordsListsTable
                                            linkedType="project"
                                            linkedId={this.props.match.params.projectId}
                                        />
                                    </div>
                                </>
                            )}
                        </LayoutWithSidebarContentWrapperInner>
                    </LayoutWithSidebarContentWrapper>
                </LayoutWithSidebar>
            </>
        );
    }
}

export { ProjectForbiddenWordsListsSite };
