import { useState } from 'react';
import Top from './Top';
import Body from './Body';
import Footer from './Footer';
import { AppContext } from './utils';

function App() {
  const [timeframe, setTimeframe] = useState(1);
  return (
    <AppContext.Provider value={{ timeframe, setTimeframe }}>
      <div className="main-grid">
        <Top />
        <Body />
        <Footer />
      </div>
    </AppContext.Provider>
  );
}

export default App;
