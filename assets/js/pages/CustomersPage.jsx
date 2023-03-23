import React, { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import customersAPI from "../services/customersAPI";

const CustomersPage = (props) => {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  //Permet d'aller recuperer les customers
  const fetchCustomers = async () => {
    try {
      const data = await customersAPI.findAll();
      setCustomers(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  //Auchargement du composant on va chercher les cusomers
  useEffect(() => {
    fetchCustomers();
  }, []);

  //Gestion de la supression d'un customer
  const handleDelete = async (id) => {
    const originalCustomers = [...customers];

    //1. L'approche optimiste
    setCustomers(customers.filter((customer) => customer.id !== id));

    //2. L'approche pessimiste
    try {
      await customersAPI.delete(id);
    } catch (error) {
      setCustomers(originalCustomers);
    }
    

    // deuxieme fasson
    // customersAPI
    //   .delete(id)
    //   .then((response) => console.log("OK !"))
    //   .catch((error) => {
    //     setCustomers(originalCustomers);
    //     console.log(error.response);
    //   });
  };

  //Gestion du changement de page
  // 1 seul fonction donc pas d'accolade obligatoire
  const handlePageChange = (page) => setCurrentPage(page);

  //Gestion de la recherche
  const handleSearch = ({ currentTarget }) => {
    setSearch(currentTarget.value);
    setCurrentPage(1);
  };

  const itemsPerPage = 10;

  //Filtrage des customers en fonction de la recherche
  const filteredCustomers = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  //Pagination des données
  const paginatedCustomers = Pagination.getData(
    filteredCustomers,
    currentPage,
    itemsPerPage
  );

  return (
    <>
      <h1>Liste des clients</h1>

      <div className="form-group">
        <input
          type="text"
          onChange={handleSearch}
          value={search}
          className="form-control"
          placeholder="Rechercher ..."
        />
      </div>

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Id.</th>
            <th>Client</th>
            <th>Email</th>
            <th>Entreprise</th>
            <th className="text-center"><span className="badge rounded-pill bg-success">Factures</span></th>
            <th className="text-center">Montant total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {paginatedCustomers.map((customers) => (
            <tr key={customers.id}>
              <td>{customers.id}</td>
              <td>
                <a href="#">
                  {customers.firstName} {customers.lastName}
                </a>
              </td>
              <td>{customers.email}</td>
              <td>{customers.company}</td>
              <td className="text-center">
                <span>{customers.invoices.length}</span>
              </td>
              <td className="text-center">
                {customers.totalAmount.toLocaleString()} €
              </td>
              <td>
                <button
                  onClick={() => handleDelete(customers.id)}
                  disabled={customers.invoices.length > 0}
                  className="btn btn-sm btn-danger"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {itemsPerPage < filteredCustomers.length && (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          length={filteredCustomers.length}
          onPageChanged={handlePageChange}
        />
      )}
    </>
  );
};

export default CustomersPage;
