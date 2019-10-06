import React, { Component } from 'react';
import { FaStar, FaRegStar, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import _ from 'lodash';
import './App.css';

class MovieDatabase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      dataRender: [],
      searchedMovies: [],
      movieDetail: [],
      renderDetail: false,
      movieDisplay: null,
      renderFavourites: false,
      favouritesMovies: localStorage.getItem("favourites") ? JSON.parse(localStorage.getItem("favourites")) : [],
    };
  }

  handleInputChange = (ev) => {
    this.setState({ query: ev.target.value })
  }

  handleSearchClick = () => {
    fetch('http://omdbapi.com/?apikey=d8168623&s=' + this.state.query)
      .then(response => response.json())
      .then(data => this.renderData(data));
  }

  handleMovieClick = (data) => {
    this.setState({ renderDetail: true, movieDisplay: data, renderFavourites: false })
  }

  showFavourites = () => {
    this.setState({ renderFavourites: true })
  }

  closeFavourites = () => {
    this.setState({ renderFavourites: false })
  }

  closeDetail = () => {
    this.setState({ renderDetail: false })
  }

  renderData = (data) => {
    let dataRender = []
    let searchedMovies = []
    if (data.Error !== 'Movie not found!' && data.Error !== 'Something went wrong.') {
      data.Search.map((data, i) => {
        searchedMovies.push(data)
        dataRender.push(<div key={i} className="movie"><span className="movieTitle" onClick={() => this.handleMovieClick(data)}>{data.Title}</span></div>)
        return true
      })
    }
    else {
      dataRender = <div className="noMovie">No movie found</div>
    }
    this.setState({ dataRender, searchedMovies })
  }

  reloadFavouriteMovies = () => {
    let favouritesMovies = localStorage.getItem("favourites") ? JSON.parse(localStorage.getItem("favourites")) : []
    this.setState({ favouritesMovies })
  }

  handleKeyDown = (ev) => {
    if (ev.key === 'Enter') {
      this.handleSearchClick()
    }
  }

  render() {
    return (
      <div className="searchForm">
        {
          !this.state.renderDetail && !this.state.renderFavourites && 
          <div className="searchDiv">
            <div className="title">Movie database</div>
              <input
                className="searchInput"
                type="text"
                placeholder="Find movies"
                value={this.state.query}
                onChange={this.handleInputChange}
                onKeyDown={(ev) => this.handleKeyDown(ev)}
              />
          </div>
        }
        {
          !this.state.renderDetail && !this.state.renderFavourites && 
          <div className="searchButton">
            <button className="search" onClick={this.handleSearchClick}>Search</button>
            <button className="favourites" onClick={this.showFavourites}>Favourite movies</button>
          </div>
        }
        {
          !this.state.renderDetail && !this.state.renderFavourites 
            ? <div className="movieList">{this.state.dataRender}</div> 
            : !this.state.renderFavourites 
              ? <div className="movieDetailDiv"><Detail movie={this.state.movieDisplay} showFavourites={this.showFavourites} 
                                                reloadFavouriteMovies={this.reloadFavouriteMovies} closeDetail={this.closeDetail}
                                                favouriteMovies={this.state.favouritesMovies}></Detail>
                </div>
              : <FavouriteList favouriteMovies={this.state.favouritesMovies} openDetail={this.handleMovieClick} closeFavourites={this.closeFavourites}
                 reloadFavouriteMovies={this.reloadFavouriteMovies}></FavouriteList>
        }
      </div>
    )
  }
}

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInFavourites: false,
      detailedData: null,
    };
  }
  componentDidMount() {
    this.changeFavourites()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.favouriteMovies !== this.props.favouriteMovies) {
      this.changeFavourites()
    }
  }

  changeFavourites() {
    let movie = this.props.movie
    let isInFavourites = _.find(this.props.favouriteMovies, function (m) { 
      return _.isEqual(m, movie) 
    })
    
    if (isInFavourites) {
      this.setState({ isInFavourites: true })
    } else {
      this.setState({ isInFavourites: false })
    }

    fetch('http://omdbapi.com/?apikey=d8168623&i=' + this.props.movie.imdbID)
      .then(response => response.json())
      .then(data => this.setState({ detailedData: data }));
  }

  setLocalStorage = (title) => {
    var movies = this.props.favouriteMovies ? this.props.favouriteMovies : []

    let isInFavourites = _.find(this.props.favouriteMovies, function (m) { 
      return _.isEqual(m, title)
    })

    if (!isInFavourites) {
      movies.push(this.props.movie)
      this.setState({ isInFavourites: true })
    } else {
      movies = movies.filter(function (name) {
        return !_.isEqual(name, title)
    });
      this.setState({ isInFavourites: false })
    }
    localStorage.setItem("favourites", JSON.stringify(movies))
    this.props.reloadFavouriteMovies()
  }

  render() {
    return (
      <div className="movieDetail">
        <div className="container">
          <div className="row filmHeader">
            <div className="col-lg-1 favouriteStar">
              {
                this.state.isInFavourites && <FaStar className="starIcon" onClick={() => this.setLocalStorage(this.props.movie)} />
              }
              {
                !this.state.isInFavourites && <FaRegStar style={{ fontSize: '2em', position: 'absolute' }} onClick={() => this.setLocalStorage(this.props.movie)} />
              }
            </div>
            <div className="col-lg-11 movieName">
              <div className="row">
                <span>{this.state.detailedData && this.state.detailedData.Title} </span>
                <span>&nbsp;({this.state.detailedData && this.state.detailedData.Year})</span>
              </div>
              <div className="row smallDetails">
                <span>{this.state.detailedData && this.state.detailedData.Runtime} | </span>
                <span>&nbsp;{this.state.detailedData && this.state.detailedData.Genre} | </span>
                <span>&nbsp;{this.state.detailedData && this.state.detailedData.Country}</span>
              </div>
              <div className="col-sm-5"></div>
            </div>
          </div>
          <div className="row filmDetailsBottom">
            <div className="col-sm">
              <img
                src={this.state.detailedData ? this.state.detailedData.Poster : ''}
                alt="no img"
                className="movieImage"
              />
            </div>
            <div className="col filmDetailsBottomText">
              {
                this.state.detailedData && this.state.detailedData.Director !== "N/A" && 
                <div className="row textDetails">
                  <span className="detailHeaders">Director: </span>
                  <span>{this.state.detailedData && this.state.detailedData.Director}</span>
              </div>
              }
              {
                this.state.detailedData && this.state.detailedData.Writer !== "N/A" && 
                <div className="row textDetails">
                  <span className="detailHeaders">Writer: </span>
                  <span>{this.state.detailedData && this.state.detailedData.Writer}</span>
                </div>
              }
              <div className="row textDetails">
                <span className="detailHeaders">Actors: </span>
                <span>{this.state.detailedData && this.state.detailedData.Actors}</span>
              </div>
              <div className="row textDetails">
                <span className="detailHeaders">Plot: </span>
                <span>{this.state.detailedData && this.state.detailedData.Plot}</span>
              </div>
            </div>
          </div>
          <div className="row filmHeader">
            <div className="col sm-6">
              <span onClick={this.props.closeDetail} className="buttonBack"><FaArrowLeft /> Search movie</span>
            </div>
            <div className="col sm-6">
              <span onClick={this.props.showFavourites} className="buttonFavourites">Go to favourites <FaArrowRight /></span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class FavouriteList extends Component {

  setLocalStorage = (movie) => {
    var movies = this.props.favouriteMovies ? this.props.favouriteMovies : []
    movies = movies.filter(function (name) {
      return !_.isEqual(name, movie)
    });
    localStorage.setItem("favourites", JSON.stringify(movies))
    this.props.reloadFavouriteMovies()
  }


  render() {
    return (
      <div className="favouriteMoviesList">
        <div className="container">
          <div className="row favouriteMoviesHeader">
            Favourite movies
          </div>
          <div className="row favouriteMoviesTableHeader">{this.props.favouriteMovies.length} Titles</div>
          {
            this.props.favouriteMovies.map((movie, i) => 
            <div key={i} className="row noPadding favouriteMovie">
              <div className="col-sm-2">
                <div className="favouriteMoviesImages">
                  <img
                    src={movie.Poster}
                    alt="no img"
                    className="movieImage"
                  />
                </div>
              </div>
              <div className="col-sm-8">
                <div className="row" style={{ paddingTop: "1em" }}><span className="movieTitleFavourites" onClick={() => this.props.openDetail(movie)}>{movie.Title}</span></div>
                <div className="row"><span className="movieYear">({movie.Year})</span></div>
              </div>
              <div className="col-sm-2">
                <svg className="iconCenter">
                  <FaStar className="starIconFavouriteMovie" onClick={() => this.setLocalStorage(movie)} />
                  <FaRegStar className="starIconBorderFavouriteMovie" onClick={() => this.setLocalStorage(movie)} />
                </svg>
              </div>
            </div>)
          }
          <span onClick={this.props.closeFavourites} className="buttonBackFavourites"><FaArrowLeft />Back</span>
        </div>
      </div>
    )
  }
}

export default MovieDatabase;
