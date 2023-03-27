import axios from "axios";
import Cache from "./cache";
import { CUSTOMERS_API } from "../../config";

async function findAll() {
  const cachedCustomers = await Cache.get("customers");

  if (cachedCustomers) return cachedCustomers;
  return axios.get(CUSTOMERS_API).then((response) => {
    const customers = response.data["hydra:member"];
    Cache.set("customers", customers);
    return customers;
  });
}

async function find(id) {
  const cachedCustomer = await Cache.get("customers." + id);
  if (cachedCustomer) return cachedCustomer;
  axios.get(CUSTOMERS_API + "/" + id).then((response) => {
    const customer = response.data;

    Cache.set("customers." + id, customer);

    return customer;
  });
}

async function deleteCustomer(id) {
  const response = await axios.delete(CUSTOMERS_API + "/" + id);
  const cachedCustomers = await Cache.get("customers");
  if (cachedCustomers) {
    Cache.set(
      "customers",
      cachedCustomers.filter((c) => c.id !== id)
    );
  }
  return await response;
}

async function update(id, customer) {
  const response = await axios
    .put(CUSTOMERS_API + "/" + id, customer);
  const cachedCustomers = await Cache.get("customers");
  const cachedCustomer = await Cache.get("customers." + id);
  if (cachedCustomer) {
    Cache.set("customers." + id, response.data);
  }
  if (cachedCustomers) {
    const index = cachedCustomers.findIndex((c) => c.id === +id);
    cachedCustomers[index] = response.data;
  }
  return await response;
}

async function create(customer) {
  const response = await axios.post(CUSTOMERS_API, customer);
  const cachedCustomers = await Cache.get("customers");
  if (cachedCustomers) {
    Cache.set("customers", [...cachedCustomers, response.data]);
  }
  return await response;
}

export default {
  findAll,
  delete: deleteCustomer,
  find,
  update,
  create,
};
