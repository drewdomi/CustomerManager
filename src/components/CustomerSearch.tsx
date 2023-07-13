import { Paper, FormControl, Box, Button, Typography } from "@mui/material";
import Title from "./Title";
import FormInput from "./FormInput";
import { useState } from "react";
import api from "../services/api";
import CustomAlert from './CustomAlert';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import isValidCPF from "../snippets/isValidCpf";
import CustomerEditorModal from "./CustomerEditorModal";

export interface CustomerProps {
  id: string,
  name: string,
  cpf: string,
  email: string,
  birthday: string,
}

function CustomerSearch() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [errorCpf, setErrorCpf] = useState(false);
  const [searchResult, setSearchResult] = useState(false);
  const [birthday] = useState("");
  const [email] = useState("");
  const [customer, setCustomer] = useState<CustomerProps[]>([{ id, name, cpf, email, birthday }]);
  const [alertCustomerName, setAlertCustomerName] = useState("");
  const [alertCustomerId, setAlertCustomerId] = useState("");
  const [alertWarn, setAlertWarn] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const handleCustomerDeleteOnClick = (customer: CustomerProps) => {
    alertHandleToggle();
    setAlertCustomerName(customer.name);
    setAlertCustomerId(customer.id);
  };

  const alertHandleToggle = () => {
    setAlertWarn(prev => !prev);
  };

  const alertHandleCancelDelete = () => {
    setAlertWarn(false);
    setAlertCustomerName("");
    setAlertCustomerId("");
  };

  function cleanInputsOnClick() {
    setId("");
    setName("");
    setCpf("");
    setAlertCustomerName("");
    setAlertCustomerId("");
    setCustomer([]);
    setAlertWarn(false);
    setErrorCpf(false);
    setSearchResult(false);
    setAlertSuccess(false);
    setAlertErrorCpf(false);
  }


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomer([]);
    if (!errorCpf) {
      setAlertErrorCpf(false);
      await api.get(`?name_like=${name}${id ? `&id=${id}` : ""}${cpf ? `&cpf=${cpf}` : ""}`)
        .then(resp => setCustomer(resp.data));
      setSearchResult(true);
    }
    else {
      setSearchResult(false);
      setErrorMessage("CPF inválido!!");
      setAlertErrorCpf(true);
      setCustomer([]);
    }
  }

  async function deleteCustomer(id: string) {
    await api.delete(`${id}`);
    setSearchResult(false);
  }

  const confirmDelete = () => {
    deleteCustomer(alertCustomerId);
    alertHandleToggle();
    setAlertSuccess(true);
    setTimeout(() => {
      setAlertSuccess(false);
    }, 3000);
  };

  function handleCpf(maskedCpf: string) {
    const onlyNumbers = (str: string) => str.replace(/[^0-9]/g, "");
    setCpf(onlyNumbers(maskedCpf));

    if (maskedCpf.length === 14) {
      setAlertErrorCpf(false);
      if (isValidCPF(maskedCpf)) {
        setErrorCpf(false);
        setCpf(onlyNumbers(maskedCpf));
      }
    }
    else {
      console.log(maskedCpf);
      setErrorCpf(true);
    }
  }
  const [alertErrorCpf, setAlertErrorCpf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCustomer([])
    setSearchResult(false)
  };

  function handleCustomerEditor(customer: CustomerProps) {
    setIsModalOpen(true);
    console.log(customer);
  }

  return (
    <>
      <CustomerEditorModal
        isOpen={isModalOpen}
        handleModalClose={handleModalClose}
      />
      {
        alertErrorCpf &&
        <CustomAlert
          type="error"
          alertMessage={errorMessage}
        />
      }
      {
        alertWarn &&
        <CustomAlert
          type="warn"
          alertMessage={`Excluir: ${alertCustomerName}`}
          alertHandleConfirm={confirmDelete}
          alertHandleCancel={alertHandleCancelDelete}
        />
      }
      {
        alertSuccess &&
        <CustomAlert
          type="success"
          alertMessage="Sucesso!!"
        />

      }
      <Title>
        Pesquisar Cliente
      </Title>
      <Paper
        elevation={2}
        sx={{
          padding: "15px",
        }}
      >
        <FormControl
          component="form"
          autoComplete="off"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <FormInput
              label="ID"
              type="id"
              onChange={e => setId(e.target.value)}
              value={id}
              required={false}
              sx={{
                flexGrow: 1,
                width: "100px",
              }}
            />

            <FormInput
              label="CPF"
              type="cpf"
              value={cpf}
              onChange={e => handleCpf(e.target.value)}
              error={errorCpf}
              required={false}
            />
          </Box>
          <FormInput
            label="Nome"
            onChange={e => setName(e.target.value)}
            value={name}
            required={false}
            sx={{
              flexGrow: 3,
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <Button
              variant="contained"
              type="submit"
              startIcon={<SearchRoundedIcon />}
            >
              Pesquisar
            </Button>
            <Button
              onClick={cleanInputsOnClick}
              startIcon={<DeleteOutlineRoundedIcon />}
            >
              Limpar
            </Button>
          </Box>
        </FormControl>
      </Paper>
      {searchResult &&
        <Paper
          elevation={2}
          sx={{
            padding: "15px",
          }}
        >
          {customer.map((customer, key) => {
            return (
              <Box
                key={key}
                sx={{
                  paddingBottom: "20px",
                  marginBottom: "10px",
                  borderBottom: "solid 1px #b4b4b4",
                }}
              >
                <Box>
                  <Typography><strong>ID:</strong> {customer.id}</Typography>
                  <Typography><strong>Nome:</strong> {customer.name}</Typography>
                  <Typography><strong>CPF:</strong> {customer.cpf}</Typography>
                  <Typography><strong>E-Mail:</strong> {customer.email}</Typography>
                  <Typography><strong>Data de Nascimento:</strong> {customer.birthday}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<EditRoundedIcon />}
                    onClick={() => handleCustomerEditor(customer)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCustomerDeleteOnClick(customer)}
                    startIcon={<PersonRemoveRoundedIcon />}
                  >
                    Excluir
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Paper>
      }
    </>
  );
}

export default CustomerSearch;