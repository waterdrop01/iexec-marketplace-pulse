import { useContext } from 'react';
import ReactSlider from 'react-slider';
import { AppContext } from './utils';

const Slider = ({ labels }) => {
  const { timeframe, setTimeframe } = useContext(AppContext);
  return (
    <div className="customSliderContainer">
      <ReactSlider
        className="customSlider"
        thumbClassName="customSlider-thumb"
        trackClassName="customSlider-track"
        markClassName="customSlider-mark"
        marks={labels.map((value, index) => index)}
        min={0}
        max={labels.length - 1}
        value={timeframe}
        onChange={setTimeframe}
        renderThumb={(props, state) => (
          <div {...props}>{labels[state.valueNow]}</div>
        )}
        renderMark={(props) => {
          return <span {...props}>{labels[props.key]}</span>;
        }}
      />
    </div>
  );
};

export default Slider;
