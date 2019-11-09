import React, { Component } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

// Wikipedia API link
const searchUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&limit=20&format=json&search=";

class SongInfo extends Component {
    constructor() {
        super();
        const params = this.getHashParams();
        const token = params.access_token;
        if (token) {
            spotifyApi.setAccessToken(token);
        }

        this.state = {
            loggedIn: token ? true : false,
            nowPlaying: {
                name: '',
                artist: '',
                albumArt: '',
                releaseDate: ''
            },
            description: ''
        }
    }

    //Function given in Spotify API used to create a random hash for the access token
    getHashParams = () => {
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

    //Setting the state of the current song details from the Spotify API
    getNowPlaying = () => {
        spotifyApi.getMyCurrentPlaybackState()
            .then((response) => {
                const { name, album, artists } = response.item;
                this.setState({
                    nowPlaying: {
                        name: name,
                        albumArt: album.images[0].url,
                        artist: artists[0].name,
                        releaseDate: album.release_date
                    }
                });
            })
    }

    //Formatting the realse date from dd/mm/yyyy to mm dd, yyyy 
    formatReleaseDate = (date) => {
        let selectMonth = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        let month = selectMonth[parseInt(date.slice(5, 7) - 1)]
        let day = date.slice(8, 10)
        let year = date.slice(0, 4)
        return month + " " + day + ", " + year;
    }

    // Takes in an artist name as a search term and uses the 
    // Wikipedia API to get a JSON response of a description
    getWiki = (term) => {
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        fetch(proxyurl + searchUrl + "/" + term)
            .then(response => response.json())
            .then(contents => {
                this.setState({
                    description: contents[2][0]
                });
            }).catch(() => console.log("Can’t access " + searchUrl + " response. Blocked by browser?"))
    }


    render() {
        const { name, artist, albumArt, releaseDate } = this.state.nowPlaying;
        return (
            <div className="songInfo" >

                {!this.state.loggedIn && <a href='http://localhost:8888' > Login to Spotify </a>}

                {/* Song name */}
                <div>
                    {name && <p>Now Playing: {name}</p>}
                </div>

                {/* Artist name */}
                <div>
                    {artist && <p>Artist: {artist}</p>}
                </div>

                {/* Checking to see if there is alubm art and then rendering it if true*/}
                <div>
                    {albumArt && <img src={albumArt} alt="Album art not found" style={{ height: 150 }} />}
                </div>

                {/* Function call to format the realse date from dd/mm/yyyy to mm dd, yyyy */}
                {/* && used to only show a date when it is available*/}
                <div>
                    {releaseDate && this.formatReleaseDate(releaseDate)}
                </div>

                {/* Calling a function to get the artist descriptoino form Wikipedia */}
                <div>
                    {this.state.nowPlaying.artist &&
                        <button
                            onClick={() => this.getWiki(artist)}>
                            Artist Description
                        </button>
                    }
                </div>

                {/* Rendering description */}
                <div>
                    <p>{this.state.description}</p>
                </div>


                {this.state.loggedIn &&
                    <button
                        id="spotify-button"
                        disabled={false} // checking to see if anything is playing
                        onClick={() => this.getNowPlaying()}>
                        Check Now Playing
                    </button>
                }
            </div>
        );
    }
}
export default SongInfo;