import { GoPulse } from 'react-icons/go';
import Logo from './iexec-logo.svg';
import Slider from './Slider';

const labels = ['1D', '1W', '1M'];

const Header = () => (
  <div className="top">
    <div className="top-container">
      <div className="top-left"></div>
      <div className="top-middle">
        <div className="top-middle-center">
          <div className="top-middle-center-container">
            <img className="logo" src={Logo} alt="iExec logo" />
            <div className="top-title-container">
              <span className="top-title">Marketplace Pulse</span>
              <GoPulse className="pulse-icon" />
            </div>
          </div>
        </div>
      </div>
      <div className="top-right">
        <Slider labels={labels} />
      </div>
    </div>
  </div>
);

export default Header;
