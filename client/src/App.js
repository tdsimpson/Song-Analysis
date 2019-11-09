import React from 'react';
import Header from './components/Header'
import SongInfo from './components/SongInfo'

const App = () => {
  return (
    <div>
      <Header title="Song Analysis App" subtitle="Learn about the song you are currently listening to." />
      <SongInfo />
    </div>
  );
}

export default App;
