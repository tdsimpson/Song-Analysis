import React, { Component } from 'react';
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

const searchUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="; // site that doesn’t send Access-Control-*

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', artist: '', albumArt: '', releaseDate: '' },
    }
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            albumArt: response.item.album.images[0].url,
            artist: response.item.artists[0].name,
            releaseDate: response.item.album.release_date
          }
        });
      })
  }

  formatReleaseDate(date) {
    let selectMonth = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    let month = selectMonth[parseInt(date.slice(5, 7) - 1)]
    let day = date.slice(8, 10)
    let year = date.slice(0, 4)
    return month + " " + day + " " + year;
  }

  getWiki(term) {
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    fetch(proxyurl + searchUrl + "/" + term) // https://cors-anywhere.herokuapp.com/https://example.com
      .then(response => response.text())
      .then(contents => { console.log(contents) }
      )
      .catch(() => console.log("Can’t access " + searchUrl + " response. Blocked by browser?"))
  }


  render() {

    // // var { items = [] } = this.props;
    // // var { isLoaded } = this.state;
    // // if (!isLoaded) {
    //   return <div> Loading...</div>;
    // }
    // else {
    return (
      <div className="App" >
        <a href='http://localhost:8888' > Login to Spotify </a>
        <div>
          Now Playing: {this.state.nowPlaying.name}
        </div>
        <div>
          Artist: {this.state.nowPlaying.artist}
        </div>
        <div>
          <img src={this.state.nowPlaying.albumArt} alt="Album art not found" style={{ height: 150 }} />
        </div>
        <div>
          {this.formatReleaseDate(this.state.nowPlaying.releaseDate)}
        </div>

        <div>
          {this.getWiki(this.state.nowPlaying.artist)}
        </div>

        {this.state.loggedIn &&
          <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button>
        }
      </div >
    );
  }
}
//}

export default App;
