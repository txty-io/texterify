import { Button, Comment } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import { authStore } from "../stores/AuthStore";
import { Styles } from "./Styles";
import { UserAvatar } from "./UserAvatar";

type IProps = {};
type IState = {};

class KeyComments extends React.Component<IProps, IState> {
    render() {
        return (
            <>
                <p style={{ color: Styles.COLOR_TEXT_DISABLED, fontStyle: "italic" }}>No comments.</p>
                <Comment
                    avatar={
                        <UserAvatar user={authStore.currentUser} />
                    }
                    author={authStore.currentUser && authStore.currentUser.username}
                    content={
                        <>
                            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
                            <Button htmlType="submit" type="primary" style={{ marginTop: 8 }}>
                                Send message
                            </Button>
                        </>
                    }
                />
            </>
        );
    }
}

export { KeyComments };
