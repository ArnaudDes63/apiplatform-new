import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/forms/Field";
import Select from "../components/forms/Select";
import CustomersAPI from "../services/customersAPI";
import InvoicesAPI from "../services/invoicesAPI";

const InvoicePage = ({ history, match }) => {
  const { id = "new" } = match.params;

  const [invoice, setInvoice] = useState({
    amount: "",
    customer: "",
    status: "SENT",
  });

  const [customers, setCustomers] = useState([]);

  const [editing, setEditing] = useState(false);

  const [errors, setErrors] = useState({
    amount: "",
    customer: "",
    status: "",
  });

  //Recuperation des clients
  const fetchCustomers = async () => {
    try {
      const data = await CustomersAPI.findAll();
      setCustomers(data);

      if (!invoice.customer) setInvoice({ ...invoice, customer: data[0].id });
    } catch (error) {
      history.replace("/invoices");
      //TODO : flash notif
    }
  };

  //Recuperation d'une facture
  const fetchInvoice = async (id) => {
    try {
      const { amount, status, customer } = await InvoicesAPI.find(id);
      setInvoice({ amount, status, customer: customer.id });
    } catch (error) {
      //TODO : flash notification
      history.replace("/invoices");
    }
  };

  //Recuperation de la liste des clients a chaque chargement du composant
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Recuperation de la bonne facture quand l'identifiant change
  useEffect(() => {
    if (id !== "new") {
      setEditing(true);
      fetchInvoice(id);
    }
  }, [id]);

  // Gestion des changements des inputs dans le formulaire
  const handleChange = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    setInvoice({ ...invoice, [name]: value });
  };

  //Gestion de la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editing) {
        await InvoicesAPI.update(id, invoice);
        //TODO : flash notification succes
      } else {
        await InvoicesAPI.create(invoice);
        //TODO : flash notification succes
        history.replace("/invoices");
      }
      setErrors({});
    } catch ({ response }) {
      const { violations } = response.data;

      if (violations) {
        const apiErors = {};
        violations.forEach(({ propertyPath, message }) => {
          apiErors[propertyPath] = message;
        });
        setErrors(apiErors);
        // TODO : Flash de notification d erreur
      }
    }
  };

  return (
    <>
      {(editing && <h1>Modification d'une facture</h1>) || (
        <h1>Création d'une facture</h1>
      )}
      <form onSubmit={handleSubmit}>
        <Field
          name="amount"
          type="number"
          placeholder="Montant de la facture"
          label="Montant"
          onChange={handleChange}
          value={invoice.amount}
          error={errors.amount}
        />

        <Select
          name="customer"
          label="Client"
          value={invoice.customer} // utilise la valeur de l'état invoice
          error={errors.customer}
          onChange={handleChange}
        >
          {/* utilisez une clé unique pour chaque option */}
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.firstName} {customer.lastName}
            </option>
          ))}
        </Select>

        <Select
          name="status"
          label="statut"
          value={invoice.status}
          error={errors.status}
          onChange={handleChange}
        >
          <option value="SENT">Envoyée</option>
          <option value="PAID">Payée</option>
          <option value="CANCELLED">Annulée</option>
        </Select>

        <div className="form-group">
          <button type="submit" className="btn btn-success">
            Enregistrer
          </button>
          <Link to="/invoices" className="btn btn-link">
            Retour aux factures
          </Link>
        </div>
      </form>
    </>
  );
};

export default InvoicePage;
