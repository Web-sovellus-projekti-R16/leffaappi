import crypto from "crypto";
import { getUserReviews } from "../models/review_model.js";
import { searchMovieByTmdbId } from "../helpers/tmdbService.js";

const sharedLists = new Map();

export const createShareList = async (req, res) => {
  try {
    const accountId = req.user.id;

    const result = await getUserReviews(accountId);
    const rows = result.rows;

    const favs = rows.filter(r => r.favorite === true);

    const ids = favs.map(f => f.tmdb_id);

    const shareId = crypto.randomUUID();

    const email = req.user.email;
    const ownerName = email ? email.split("@")[0] : "user";

    sharedLists.set(shareId, {
      ownerName,
      movies: ids
    });


    res.json({
      shareId,
      url: `/share/favorites/${shareId}`
    });

  } catch (err) {
    console.error("createShareList error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSharedList = async (req, res) => {
  try {
    const shareId = req.params.id;

    const shared = sharedLists.get(shareId);
    if (!shared) return res.status(404).json({ error: "Share not found" });

    const { ownerName, movies } = shared;


    const movieData = await Promise.all(
      movies.map(async tmdb_id => {
        const raw = await searchMovieByTmdbId(tmdb_id);
        if (!raw) return null;
        return {
          tmdb_id: raw.id,
          title: raw.title,
          poster_path: raw.poster_path ? `https://image.tmdb.org/t/p/w300${raw.poster_path}` : null
        };
      })
    );

    res.json({
      ownerName,
      favorites: movieData.filter(Boolean)
    });


  } catch (err) {
    console.error("getSharedList error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
