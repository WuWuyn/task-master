import type { FC } from "react";
import { Layout, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
import NotificationIcon from "../Notifications/NotificationIcon";
import "./simpleStyle.css";

const { Header } = Layout;

type SimpleHeaderProps = {
  onMenuClick: () => void;
};

const SimpleHeader: FC<SimpleHeaderProps> = ({ onMenuClick }) => {
  return (
    <Header className="simple-header">
      <div className="simple-header-container">
        <div className="simple-header-logo">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="simple-header-actions">
          <NotificationIcon />
          <Button
            type="text"
            className="menu-toggle-btn"
            icon={<MenuOutlined />}
            onClick={onMenuClick}
            aria-label="Toggle menu"
          />
        </div>
      </div>
    </Header>
  );
};

export default SimpleHeader;
