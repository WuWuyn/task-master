import "./style.css";
import { Row, Col } from "antd";
import type { FC } from "react";
import {
  GoogleOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  GithubOutlined,
} from "@ant-design/icons";

type FooterProps = object;

const Footer: FC<FooterProps> = () => {
  return (
    <div className="footer">      
      <Row className="footer__row" gutter={[16, 24]}>
        <Col 
          className="footer__col" 
          xs={24} 
          sm={12} 
          md={6} 
          lg={6}
        >
          <h3 className="footer__col__title">Company</h3>
          <h5>About us</h5>
          <h5>Our information</h5>
          <h5>Privacy policy</h5>
          <h5>Affiliate Program</h5>
        </Col>

        <Col 
          className="footer__col" 
          xs={24} 
          sm={12} 
          md={6} 
          lg={6}
        >
          <h3 className="footer__col__title">Get help</h3>
          <h5>FAQ</h5>
          <h5>Training</h5>
          <h5>Coaching</h5>
          <h5>Help</h5>
        </Col>

        <Col 
          className="footer__col" 
          xs={24} 
          sm={12} 
          md={6} 
          lg={6}
        >
          <h3 className="footer__col__title">Feature</h3>
          <h5>Scheduling</h5>
          <h5>Management</h5>
          <h5>Analytics</h5>
        </Col>

        <Col 
          className="footer__col" 
          xs={24} 
          sm={12} 
          md={6} 
          lg={6}
        >
          <h3 className="footer__col__title">Follow us</h3>
          <div className="footer__col__icon">
            <div className="footer__col__icon__i">
              <GoogleOutlined className="icon" />
            </div>
            <div className="footer__col__icon__i">
              <InstagramOutlined className="icon" />
            </div>
            <div className="footer__col__icon__i">
              <YoutubeOutlined className="icon" />
            </div>
            <div className="footer__col__icon__i">
              <TwitterOutlined className="icon" />
            </div>
            <div className="footer__col__icon__i">
              <GithubOutlined className="icon" />
            </div>
          </div>
        </Col>
      </Row>

      <div className="footer__text">
        Copyright @TaskMaster. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
