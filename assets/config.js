if (typeof process === "undefined") {
  global.process = { env: { API_URL: "/api/" } };
} else if (typeof process.env.API_URL === "undefined") {
  process.env.API_URL = "/api/";
}

export const API_URL = process.env.API_URL;

export const CUSTOMERS_API = API_URL + "customers";
export const INVOICES_API = API_URL + "invoices";
export const USERS_API = API_URL + "users";
export const LOGIN_API = API_URL + "login_check";
