import moment from "moment";
import React, { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import InvoicesAPI from "../services/invoicesAPI";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const STATUS_CLASSES = {
  PAID: "success",
  SENT: "primary",
  CANCELLED: "danger",
};

const STATUS_LABELS = {
  PAID: "Payée",
  SENT: "Envoyée",
  CANCELLED: "Annulée",
};

const InvoicesPage = (props) => {
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchInvoices = async () => {
    try {
      const data = await InvoicesAPI.findAll();
      setInvoices(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des factures !");

    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  //Gestion du changement de page
  // 1 seul fonction donc pas d'accolade obligatoire
  const handlePageChange = (page) => setCurrentPage(page);

  //Gestion de la recherche
  const handleSearch = ({ currentTarget }) => {
    setSearch(currentTarget.value);
    setCurrentPage(1);
  };

  //Gestion de la supression d'un customer
  const handleDelete = async (id) => {
    const originalInvoices = [...invoices];

    //1. L'approche optimiste
    setInvoices(invoices.filter((invoice) => invoice.id !== id));

    //2. L'approche pessimiste
    try {
      await InvoicesAPI.delete(id);
      toast.success("La facture a bien été supprimée");
    } catch (error) {
      console.log(error.response);
      toast.error("Une erreur est survenue");
      setInvoices(originalInvoices);
    }
  };

  const itemsPerPage = 13;

  //Gestion du format date
  const formatDate = (str) => moment(str).format("DD/MM/YYYY");

  //Filtrage des customers en fonction de la recherche
  const filteredInvoices = invoices.filter(
    (i) =>
      i.customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
      i.customer.lastName.toLowerCase().includes(search.toLowerCase()) ||
      i.amount.toString().startsWith(search.toLowerCase()) ||
      STATUS_LABELS[i.status].toLowerCase().includes(search.toLowerCase())
  );

  //Pagination des données
  const paginatedInvoices = Pagination.getData(
    filteredInvoices,
    currentPage,
    itemsPerPage
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Liste des factures</h1>
        <Link className="btn btn-primary" to="/invoices/new">
          Créer une facture
        </Link>
      </div>

      <div className="form-group">
        <input
          type="text"
          onChange={handleSearch}
          value={search}
          className="form-control"
          placeholder="Rechercher ..."
        />
      </div>

      <table className="table tbale-hover">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Client</th>
            <th className="text-center">Date d'envoie</th>
            <th className="text-center">Statut</th>
            <th className="text-center">Montant</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paginatedInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td> {invoice.chrono} </td>
              <td>
                <Link to={"/customers/" + invoice.customer.id}>
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </Link>
              </td>
              <td className="text-center">{formatDate(invoice.sentAt)}</td>
              <td className="text-center">
                <span
                  className={
                    "badge rounded-pill bg-" + STATUS_CLASSES[invoice.status]
                  }
                >
                  {STATUS_LABELS[invoice.status]}
                </span>
              </td>
              <td className="text-center">{invoice.amount.toLocaleString()}</td>
              <td>
                <Link
                  to={"/invoices/" + invoice.id}
                  className="btn btn-sm btn-primary"
                >
                  Editer
                </Link>
                &nbsp;
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(invoice.id)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {itemsPerPage < filteredInvoices.length && (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChanged={handlePageChange}
          length={filteredInvoices.length}
        />
      )}
    </>
  );
};

export default InvoicesPage;
