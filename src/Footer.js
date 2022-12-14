import {
  FaDiscord,
  FaTelegramPlane,
  FaTwitter,
  FaFacebookF,
  FaYoutube,
  FaGithub,
} from 'react-icons/fa';
import { BsMedium } from 'react-icons/bs';
import Logo from './iexec-logo.svg';

const Footer = () => (
  <div className="footer">
    <div className="footer-container">
      <div className="footer-left">
        <img className="iexec-logo-footer" src={Logo} alt="iExec logo" />
      </div>
      <div className="footer-middle">
        <div className="social-logos">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://twitter.com/iex_ec"
            className="social-icon"
          >
            <FaTwitter />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://t.me/iexec_rlc_official"
            className="social-icon"
          >
            <FaTelegramPlane />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/pbt9m98wnU"
            className="social-icon"
          >
            <FaDiscord />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.youtube.com/channel/UCwWxZWvKVHn3CXnmDooLWtA"
            className="social-icon"
          >
            <FaYoutube />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/iExecBlockchainComputing"
            className="social-icon"
          >
            <FaGithub />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.facebook.com/iexecteam/"
            className="social-icon"
          >
            <FaFacebookF />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://medium.com/iex-ec"
            className="social-icon"
          >
            <BsMedium />
          </a>
        </div>
      </div>
      <div className="footer-right">
        iExec Marketplace Pulse ?? {new Date().getFullYear()}
      </div>
    </div>
    <div className="footer-bottom"></div>
  </div>
);

export default Footer;
