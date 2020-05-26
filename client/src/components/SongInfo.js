import React, { Component } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class SongInfo extends Component {
    constructor() {
        super();
        const params = this.getHashParams();
        const token = params.access_token;
        if (token) {
            spotifyApi.setAccessToken(token);
        }

        this.state = {
            loggedIn: !!token, // true or false
            currentlyPlaying: false,
            nowPlaying: {
                id: '',
                name: '',
                artist: '',
                albumArt: '',
                releaseDate: ''
            },
            description: '',
            key: '',
            mode: ''
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

    getMusicalKey = (id) => {
        const keys = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
        const modes = ['minor', 'major']
        spotifyApi.getAudioAnalysisForTrack(id)
            .then((response) => {
                const { key, mode } = response.track;
                console.log('Key:', keys[key], modes[mode]);
                this.setState({
                    key: keys[key],
                    mode: modes[mode]
                })
            }).catch(() => console.log('Unable to get musical key'));
    }


    //Setting the state of the current song details from the Spotify API
    getNowPlaying = () => {
        spotifyApi.getMyCurrentPlaybackState()
            .then((response) => {
                const { id = "id", name = "nn", album = "na", artists = "naa" } = response.item;
                this.setState({
                    currentlyPlaying: true,
                    nowPlaying: {
                        id: id,
                        name: name,
                        albumArt: album.images[0].url,
                        artist: artists[0].name,
                        releaseDate: album.release_date
                    }
                })
                console.log('song playing', this.state.currentlyPlaying);
                this.getMusicalKey(id);
            }).catch(() => (this.setState({
                currentlyPlaying: false
            })));
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
        const url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="
        fetch(proxyurl + url + term) // https://cors-anywhere.herokuapp.com/https://example.com
            .then(response => response.json())
            .then(contents => {
                for (const objkey in contents.query.pages) {
                    //there is an attribut that is based on the id of the page. The name isn't known, so I loop through all objects (but there is only one)
                    const extractedDescription = contents.query.pages[objkey].extract;
                    this.setState({
                        description: extractedDescription
                    });
                }

            }).catch(() => console.log("Can’t access " + url + term + " response."))
    }

    componentDidMount() {
        this.getNowPlaying();
    }



    render() {
        const { name, artist, albumArt, releaseDate } = this.state.nowPlaying;
        const { description, key, mode } = this.state;
        return (
            <div className="songInfo" >

                {!this.state.currentlyPlaying && this.state.loggedIn ? <p>No music playing</p> : ''}

                {!this.state.loggedIn && <a href='http://localhost:8888' > Login to Spotify </a>}

                {this.state.loggedIn && this.state.currentlyPlaying &&
                    <button
                        id="spotify-button"
                        onClick={() => this.getNowPlaying()}>
                        Check Now Playing
                    </button>
                }

                {/* Song name */}
                <div>
                    {name && <p>Now Playing: <b>{name}</b></p>}
                </div>

                {/* Artist name */}
                <div>
                    {artist && <p>Artist: <b>{artist}</b></p>}
                </div>

                {/* Artist name */}
                <div>
                    {key && mode && <p>Key: <b>{key} {mode}</b></p>}
                </div>

                {/* Checking to see if there is alubm art and then rendering it if true*/}
                <div>
                    {albumArt && <img src={albumArt} alt="Album art not found" style={{ height: 150 }} />}
                </div>

                {/* Function call to format the realse date from dd/mm/yyyy to mm dd, yyyy */}
                {/* && used to only show a date when it is available */}
                <div>
                    {releaseDate && this.formatReleaseDate(releaseDate)}
                </div>

                {/* Calling a function to get the artist descriptoino form Wikipedia */}
                <div>
                    {artist &&
                        <button
                            className="description-button"
                            onClick={() => this.getWiki(artist)}>
                            Artist Description
                        </button>
                    }
                </div>

                {/* Rendering description */}
                <div>
                    <p className="description"> {description}</p>
                </div>
            </div>
        );
    }
}
export default SongInfo;