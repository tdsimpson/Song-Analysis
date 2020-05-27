import React, { Component } from 'react';
import { Palette } from 'react-palette';
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
            mode: '',
            tempo: ''
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
                const { key, mode, tempo } = response.track;
                console.log('Key:', keys[key], modes[mode]);
                console.log('tempo', Math.floor(tempo));
                this.setState({
                    key: keys[key],
                    mode: modes[mode],
                    tempo: Math.floor(tempo)
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
                        releaseDate: this.formatReleaseDate(album.release_date)
                    }
                })
                console.log('song playing', this.state.currentlyPlaying);
                this.getMusicalKey(id);
            }).catch(() => (this.setState({
                currentlyPlaying: false
            })));
    }

    //Formatting the realse date from yyyy-mm-dd to mm dd, yyyy 
    formatReleaseDate = (date) => {
        let selectMonth = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        // Some songs don't specify a day or month, so set it as blank
        let month = "";
        let day = "";
        let year = date.slice(0, 4)

        if (date.slice(5, 6)) {
            month = selectMonth[parseInt(date.slice(5, 6))]
        }

        if (date.slice(8, 10)) {
            day = date.slice(8, 10) + ", "; //adding the comma so it only shows up if there is a day
        }

        return month + " " + day + year;
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
        const { description, key, mode, tempo } = this.state;
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

                <div className="picture-text">
                    <div>
                        {albumArt && <img className="album" src={albumArt} alt="Album art not found" />}
                    </div>
                    <div className="text-section">
                        {artist && <p><b>NOW PLAYING</b></p>}
                        {artist && <p><b>{artist}</b></p>}
                        {name && <p><b>{name}</b></p>}
                        {key && mode && <p><b>{key} {mode}</b></p>}
                        {tempo && <p><b>{`${tempo} BPM`}</b></p>}
                        {releaseDate && releaseDate}
                    </div>
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

                <Palette src={albumArt}>
                    {({ data, loading, error }) => (
                        <div>
                            <div style={{ color: data.vibrant }}>
                                Text with the vibrant color
                        </div>
                            <div style={{ color: data.darkMuted }}>
                                Text with the muted dark color
                        </div>
                        </div>
                    )}
                </Palette>

            </div>
        );
    }
}
export default SongInfo;