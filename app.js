const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("DB Server is started");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertSnakeCaseToCamelCase = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,

    directorId: eachMovie.director_id,

    movieName: eachMovie.movie_name,

    leadActor: eachMovie.lead_actor,
  };
};

//Returns a list of all movie names in the movie table

app.get("/movies/", async (request, response) => {
  const getQuery = `SELECT * FROM movie`;

  const getMovies = await db.all(getQuery);

  response.send(getMovies);
});

//Creates a new movie in the movie table.

app.post("/movies/", async (request, response) => {
  const bodyDetails = request.body;
  const { directorId, movieName, leadActor } = bodyDetails;

  const postQuery = `INSERT INTO
     movie 
     (director_id, movie_name, lead_actor)
    Values
    (${directorId}, ${movieName}, ${leadActor})`;

  const postMovieInMovieTable = await db.run(postQuery);
  const movieId = postMovieInMovieTable.lastID;
  response.send("Movie Successfully Added");
});

// Returns a movie based on the movie ID

app.get(`/movies/:movieId/`, async (request, response) => {
  try {
    const { movieId } = request.params;

    const getQuery = `SELECT * FROM movie WHERE movie_id = ${movieId}`;

    const getMovie = await db.get(getQuery);

    response.send(getMovie);
  } catch (e) {
    console.log(e.message);
  }
});

//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;

  const putQuery = `UPDATE movie SET  
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor}
    
    WHERE movie_id = ${movieId}`;

  const updateQuery = await db.run(putQuery);

  response.send("Movie Details Updated");
});

// Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", (request, response) => {
  const { movieId } = request.params;

  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;

  response.send("Movie Removed");
});

// Returns a list of all directors in the director table

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director ORDER BY director_id`;

  const getDirectors = await db.all(getDirectorQuery);

  response.send(getDirectors);
});

// Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getQuery = `SELECT movie_name AS movieName FROM movie 
    JOIN director ON 
    movie.director_id = director.director_id 
    WHERE 
    director_id = ${directorId}`;

  const getDirectorMoviesList = await db.all(getQuery);

  response.send(getDirectorMoviesList);
});

module.exports = app;
