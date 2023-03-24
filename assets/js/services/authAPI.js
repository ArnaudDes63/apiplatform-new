import axios from "axios";
import customersAPI from "./customersAPI";
import jwtDecode from "jwt-decode";

/**
 * Déconnection (suppression du token du localStorage et sur Axios)
 */
function logout() {
  window.localStorage.removeItem("authToken");
  delete axios.defaults.headers["Authorization"];
}

/**
 * Requête HTTP d'authentification et stockage du token dans le storage et sur Axios
 * @param {Object} credentials 
 */
function authenticate(credentials) {
  return axios
    .post("http://localhost:8000/api/login_check", credentials)
    .then((response) => response.data.token)
    .then((token) => {
      //je sstock le token dans mon localStorage
      window.localStorage.setItem("authToken", token);
      // On previent axios qu'on a maintenant un header par défaut sur toutes nos futures requete HTTP
      setAxiosToken(token);
    });
}

/**
 * Positionne le token JWT sur Axios
 * @param {Strinf} token Le token JWT
 */
function setAxiosToken(token) {
  axios.defaults.headers["Authorization"] = "Bearer " + token;
}


/**
 * Mise en place lors du chargement de l application
 */
function setup() {
  // 1. Voir si on a un token ?
  const token = window.localStorage.getItem("authToken");
  //2. Si le token est encore valide
  if (token) {
    const { exp: expiration } = jwtDecode(token);
    if (expiration * 1000 > new Date().getTime()) {
      setAxiosToken(token);
    }
  }
}


/**
 * 
 * Permet de savoir si on est authentifier ou pas 
 * @return boolean
 */
function isAuthenticated() {
  // 1. Voir si on a un token ?
  const token = window.localStorage.getItem("authToken");
  //2. Si le token est encore valide
  if (token) {
    const { exp: expiration } = jwtDecode(token);
    if (expiration * 1000 > new Date().getTime()) {
      return true;
    }
    return false;
  }
  return false;
}

export default {
  authenticate,
  logout,
  setup,
  isAuthenticated
};
