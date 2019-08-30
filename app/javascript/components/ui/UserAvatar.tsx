import { observer } from "mobx-react";
import * as React from "react";
import { UsersAPI } from "../api/v1/UsersAPI";
import { authStore } from "../stores/AuthStore";
import { Styles } from "./Styles";

type IProps = {
  user: any;
  light?: boolean;
  style?: React.CSSProperties;
};
type IState = {
  image: any;
};

@observer
class UserAvatar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      image: null
    };
  }

  isCurrentUser = () => {
    return authStore.currentUser && authStore.currentUser.id === this.props.user.id;
  }

  async componentDidMount() {
    if (!this.isCurrentUser() || !authStore.userImageUrl) {
      const imageResponse = await UsersAPI.getImage(this.props.user.id);
      this.setState({ image: imageResponse.image });

      if (this.isCurrentUser()) {
        authStore.userImageUrl = imageResponse.image;
      }
    }
  }

  render() {
    const hasImage = !!(this.state.image || (this.isCurrentUser() && authStore.userImageUrl));

    return (
      <div style={{ display: "inline-block" }}>
        {hasImage &&
          <img
            style={{
              height: 40,
              width: 40,
              borderRadius: Styles.DEFAULT_BORDER_RADIUS,
              ...this.props.style
            }}
            src={this.isCurrentUser() ? authStore.userImageUrl : this.state.image}
            alt="user image"
          />
        }
        {!hasImage && <div
          style={{
            height: 40,
            width: 40,
            background: this.props.light ? "rgba(255, 255, 255, 0.15)" : Styles.COLOR_PRIMARY_LIGHT,
            color: this.props.light ? "#fff" : Styles.COLOR_PRIMARY,
            borderRadius: Styles.DEFAULT_BORDER_RADIUS,
            lineHeight: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textTransform: "uppercase",
            fontSize: 14,
            ...this.props.style
          }}
        >
          {this.props.user && this.props.user.username && this.props.user.username.substr(0, 2)}
        </div>}
      </div>
    );
  }
}

export { UserAvatar };
