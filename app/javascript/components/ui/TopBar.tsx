import { RocketOutlined } from '@ant-design/icons';
import { Button } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { Constants } from "./Constants";

type IProps = RouteComponentProps & {
  white: boolean;
  history?: any;
  location?: any;
};
interface IState { }

@observer
class TopBarUnwrapped extends React.Component<IProps, IState> {
  routes: any[] = [
    {
      route: Routes.DASHBOARD.ROOT,
      name: "Dashboard",
      authenticatedOnly: true
    },
    {
      route: Routes.OTHER.ROOT,
      name: "Home",
      notAuthenticatedOnly: true
    },
    {
      route: Routes.PRODUCT.FEATURES,
      name: "Features"
    },
    {
      route: Routes.PRODUCT.PRICING,
      name: "Pricing"
    },
    {
      route: Routes.OTHER.CODE,
      name: "Source Code"
    },
    {
      route: Routes.PRODUCT.API_DOCS,
      name: "Documentation"
    },
    {
      route: Routes.AUTH.LOGIN,
      name: "Login",
      notAuthenticatedOnly: true
    },
    {
      route: Routes.AUTH.SIGNUP,
      name: (
        <Button
          type="primary"
          icon={<RocketOutlined />}
          style={{ boxShadow: "0 0 10px 0 rgba(0, 0, 0, .15)" }}
        >
          Get started
        </Button>
      ),
      notAuthenticatedOnly: true
    },
    {
      name: "Logout",
      onClick: async (): Promise<any> => {
        await AuthAPI.logout();
        this.props.history.push(Routes.AUTH.LOGIN);
      },
      authenticatedOnly: true
    }
  ];

  render() {
    return (
      <div
        className={`component-top-bar ${this.props.white ? "white" : ""}`}
        style={{
          padding: Constants.BAR_PADDING,
          width: "100%",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            display: "flex",
            alignItems: "center",
            width: "100%",
            margin: "auto"
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ marginBottom: 0 }}>
              <Link to={Routes.OTHER.ROOT}> Texterify</Link>
            </h1>
            <p style={{ fontSize: 13, marginBottom: 0 }}>
              The easy way to localize.
            </p>
          </div>
          <div>
            {this.renderRoutes()}
          </div>
        </div>
      </div>
    );
  }

  isActiveLink = (route: string): boolean => {
    return window.location.pathname === route;
  }

  getLinkStyle = (route: string): object => {
    if (this.isActiveLink(route)) {
      return { fontWeight: "bold" };
    } else {
      return {};
    }
  }

  renderRoutes = (): JSX.Element[] => {
    return this.routes.map((route: any, index: number) => {
      // Skip routes that are not authenticated only if authenticated.
      if (route.notAuthenticatedOnly && authStore.isAuthenticated) {
        return null;
      }

      // Skip routes that are authenticated only if not authenticated.
      if (route.authenticatedOnly && !authStore.isAuthenticated) {
        return null;
      }

      if (route.route) {
        return (
          <Link
            key={index}
            to={route.route}
            className="nav-link no-text-deco"
            style={{ ...this.getLinkStyle(route.route) }}
          >
            {route.name}
            a
          </Link>
        );
      } else {
        return (
          <span
            key={index}
            className="nav-link"
            onClick={route.onClick}
            role="button"
          >
            {route.name}
          </span>
        );
      }
    });
  }
}

const TopBar: any = withRouter(TopBarUnwrapped);

export { TopBar };
