import { DataGrid, GridActionsCellItem, esES } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import AddIcon from '@mui/icons-material/Add';
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import BorderColorSharpIcon from '@mui/icons-material/BorderColorSharp';
import BatchPredictionSharp from "@mui/icons-material/BatchPredictionSharp";
import Box from "@mui/system/Box";
import AlertDialog from "./AlertDialog";
import { useEffect, useState } from "react";
import { obtenerArticulos, eliminarArticulo } from "../services/Articulos";
import ModalForm from "./FormArticulos/ModalForm";
import ModalLotes from "./LotesModal/ModalLotes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function ArticulosDataGrid({ jwt }) {
  const [state, setState] = useState({
    articulos: [],
    categorias: [],
  });
  const [modalform, setModalform] = useState({
    open: false,
    tipo: "nuevo",
    datos: null,
  });

  const [modallotes, setModallotes] = useState({
    open: false,
    datos: null,
  });

  const [openDialog, setOpenDialog] = useState({ state: false, id: 0 });

  const handleNuevo = () => {
    setModalform({
      open: true,
      tipo: "nuevo",
      datos: null,
    });
  };
  const handleEditar = (data) => {
    setModalform({
      open: true,
      tipo: "editar",
      datos: data,
    });
  };
  const handleLotes = (data) => {
    setModallotes({
      open: true,
      datos: data,
    });
  };
  const handleCloseModal = () => {
    setModalform({
      open: false,
      tipo: "nuevo",
      datos: null,
    });
    setModallotes({
      open: false,
      datos: null,
    });
  };
  const handleEliminar = async (idarticulo) => {
    let eliminar = await eliminarArticulo(idarticulo, jwt);
    if (eliminar.ok) {
      handleSubmit();
      setOpenDialog({ state: false, id: 0 });
    } else {
      toast.error(eliminar.mensaje, { theme: "colored" });
    }
  };
  const handleSubmit = () => {
    cargarDatos();
  };

  const cargarDatos = async () => {
    let articulos = await obtenerArticulos(jwt);
    if (articulos.ok) {
      setState({
        articulos: articulos.data,
        categorias: articulos.categorias,
      });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const columns = [
    {
      field: "nombre",
      headerName: "Nombre",
      minWidth: 300,
    },
    {
      field: "descripcion",
      headerName: "Descripcion",
      minWidth: 400,
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      minWidth: 100,
      type: "number",
    },
    {
      field: "precioventa",
      headerName: "Precio de Venta",
      minWidth: 150,
      type: "number",
    },
    {
      field: "accions",
      headerName: "Acciones",
      minWidth: 200,
      type: "actions",
      getActions: (params) => {
        return [
          <GridActionsCellItem
            key={params.id}
            icon={<RemoveRedEyeIcon color={"secondary"} />}
            label="Lotes"
            onClick={() => {
              handleLotes(params.row);
            }}
          />,
          <GridActionsCellItem
            key={params.id}
            icon={<BorderColorSharpIcon color={"info"} />}
            label="Editar"
            onClick={() => {
              handleEditar(params.row);
            }}
          />,
          <GridActionsCellItem
            key={params.id}
            icon={<DeleteSharpIcon color={"error"} />}
            label="Eliminar"
            onClick={() => {
              setOpenDialog({ state: true, id: params.id });
            }}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 400, width: 1 }}>
      <Stack sx={{ "& button": { m: 1 } }} direction="row">


        <Button variant="contained" color="success" disabled={state.disabledNuevo} onClick={handleNuevo}>Crear<AddIcon/></Button>
      </Stack>
      <DataGrid
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        rows={state.articulos}
        columns={columns}
      />
      <AlertDialog
        open={openDialog.state}
        title={"¿Seguro que desea eliminar este artículo?"}
        body={"El artículo se eliminará de forma permanente"}
        btnText={"Eliminar"}
        close={() => setOpenDialog({ state: false, id: 0 })}
        confirm={() => {
          handleEliminar(openDialog.id);
        }}
      />
      <ModalForm
        jwt={jwt}
        open={modalform.open}
        tipo={modalform.tipo}
        datos={modalform.datos}
        categorias={state.categorias}
        close={handleCloseModal}
        submit={handleSubmit}
      />
      <ModalLotes
        jwt={jwt}
        open={modallotes.open}
        close={handleCloseModal}
        data={modallotes.datos}
      />
    </Box>
  );
}
