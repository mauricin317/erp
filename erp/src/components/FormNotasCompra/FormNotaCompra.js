import {
  DataGrid,
  GridActionsCellItem,
  GridFooterContainer,
  esES,
} from "@mui/x-data-grid";
import _ from "lodash";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddToPhotosRoundedIcon from "@mui/icons-material/AddToPhotosRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DoDisturbOnRoundedIcon from "@mui/icons-material/DoDisturbOnRounded";
import AlertDialog from "../AlertDialog";
import { useState } from "react";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Box from "@mui/system/Box";
import { formatInTimeZone } from "date-fns-tz";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalForm from "./ModalForm";
import {
  crearNotaCompra,
  obtenerDetallesNotaCompra,
  anularNotaCompra,
} from "../../services/NotaCompra";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function FormNotaCompra(props) {
  const formData = props.formData;

  const formik = useFormik({
    initialValues: {
      nronota: formData.nro_nota,
      fecha:
        props.readOnly == true
          ? formatInTimeZone(formData.fecha, "UTC", "yyy-MM-dd")
          : formatInTimeZone(new Date(), "UTC", "yyy-MM-dd"),
      descripcion: props.readOnly == true ? formData.descripcion : "",
    },
    validationSchema: Yup.object({
      fecha: Yup.date().required("Requerido"),
      descripcion: Yup.string().required("Requerido"),
    }),
    onSubmit: async (values) => {
      if (detalles.length >= 1) {
        let subtotales = _.cloneDeep(detalles);
        let total = 0;
        subtotales.forEach((elem) => {
          total = Number(total) + Number(elem.subtotal);
        });
        let notacompra = {
          nronota: values.nronota,
          descripcion: values.descripcion,
          fecha: values.fecha,
          total: total,
          detalles: detalles,
        };
        let resultado = await crearNotaCompra(notacompra, props.jwt);
        if (resultado.ok) {
          toast.success(resultado.mensaje, { theme: "colored" });
          props.enableReadOnly(
            notacompra,
            resultado.data.idnota,
            resultado.data.nronota
          );
        } else {
          toast.error(resultado.mensaje, { theme: "colored" });
        }
      } else {
        toast.error("Debe agregar 1 articulo como mínimo", {
          theme: "colored",
        });
      }
    },
  });

  const [modalform, setModalform] = useState({
    open: false,
    tipo: "nuevo",
    datos: null,
    articulo: [],
  });
  const [openDialog, setOpenDialog] = useState({ state: false });
  const [openDialogAnular, setOpenDialogAnular] = useState({ state: false });
  const [estado, setEstado] = useState(
    props.readOnly == true ? formData.estado : "Abierto"
  );
  const [detalles, setDetalles] = useState([]);

  const cargarDetalles = async () => {
    let traerDetalles = await obtenerDetallesNotaCompra(
      formData.idnota,
      props.jwt
    );
    if (traerDetalles.ok) {
      setDetalles(traerDetalles.data);
    }
  };

  if (props.readOnly && detalles.length == 0) {
    cargarDetalles();
  }

  let _articulos = _.differenceBy(
    props.formData.articulos,
    detalles,
    "idarticulo"
  );

  const handleNuevo = () => {
    setModalform({
      open: true,
      tipo: "nuevo",
      datos: null,
      articulo: [],
    });
  };

  const handleCloseModal = () => {
    setModalform({
      open: false,
      tipo: "nuevo",
      datos: null,
      articulo: [],
    });
  };

  const handleSubmitDetalle = (detalle) => {
    var detalles_hack = _.cloneDeep(detalles);
    let existe_detalle = _.findIndex(detalles_hack, { id: detalle.id });
    if (existe_detalle == -1) {
      detalles_hack.push(detalle);
      setDetalles(detalles_hack);
    } else {
      detalles_hack[existe_detalle] = detalle;
      setDetalles(detalles_hack);
    }
  };

  const handleEditarDetalle = (detalle) => {
    let detalles_hack = _.without(detalles, detalle);
    setModalform({
      open: true,
      tipo: "editar",
      datos: detalle,
      articulo: _.differenceBy(
        props.formData.articulos,
        detalles_hack,
        "idarticulo"
      ),
    });
  };

  const handleEliminarDetalle = (detalle) => {
    var detalles_hack = _.without(detalles, detalle);
    setDetalles(detalles_hack);
  };

  const handleAnular = async () => {
    setOpenDialogAnular({ state: false });
    let data = {
      idnota: formData.idnota,
      estado: -1,
    };
    let respuesta = await anularNotaCompra(data, props.jwt);
    if (respuesta.ok) {
      setEstado("Anulado");
      toast.success("Nota de Compra Anulado", { theme: "colored" });
    } else {
      toast.warn(respuesta.mensaje, { theme: "colored" });
    }
  };

  const openReport = () => {
    window.open(
      `http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FNotaCompra&standAlone=true&id_nota=${formData.idnota}&j_username=joeuser&j_password=123&sessionDecorator=no`,
      "_blank"
    );
  };

  const columns = [
    {
      field: "nombre",
      headerName: "Articulo",
      width: 300,
    },
    {
      field: "fechavencimiento",
      headerName: "Fecha Vencimiento",
      width: 150,
      valueFormatter: (params) => {
        if (params.value != "" && params.value != null) {
          let valueFormatted = formatInTimeZone(
            params.value,
            "UTC",
            "dd/MM/yyy"
          );
          return valueFormatted;
        } else {
          return "";
        }
      },
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      type: "number",
      width: 100,
    },
    {
      field: "preciocompra",
      headerName: "Precio",
      type: "number",
      width: 150,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      type: "number",
      width: 150,
    },
    {
      field: "accions",
      headerName: "Acciones",
      type: "actions",
      width: 200,
      getActions: (params) => {
        let disabled = props.readOnly;
        return [
          <GridActionsCellItem
            key={params.id}
            icon={<EditRoundedIcon color={!disabled ? "info" : ""} />}
            label="Editar"
            onClick={() => {
              handleEditarDetalle(params.row);
            }}
            disabled={disabled}
          />,
          <GridActionsCellItem
            key={params.id}
            icon={<DeleteRoundedIcon color={!disabled ? "danger" : ""} />}
            label="Eliminar"
            onClick={() => {
              handleEliminarDetalle(params.row);
            }}
            disabled={disabled}
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        width: 1,
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            height: "50px",
          }}
          direction="row"
        >
          <h2>{`${!props.readOnly ? "Nueva" : "Ver"} Nota de Compra`}</h2>
          <Stack
            sx={{ "& button": { my: 1, ml: 1 }, justifyContent: "end" }}
            direction="row"
          >
            <Button
              variant="contained"
              color="secondary"
              disabled={formik.isSubmitting}
              onClick={() => {
                props.readOnly == true
                  ? props.closeForm()
                  : setOpenDialog({ state: true });
              }}
            >
              <ArrowBackRoundedIcon />
            </Button>
            {props.readOnly == false ? (
              <Button
                variant="contained"
                color="success"
                disabled={formik.isSubmitting || props.readOnly}
                type="submit"
              >
                <SaveRoundedIcon />
              </Button>
            ) : (
              <>
                {/* <Button variant="contained" color="success" sx={{color:'white'}} ><AddCircleRoundedIcon/></Button>*/}
                <Button
                  variant="contained"
                  color="info"
                  disabled={formik.isSubmitting}
                  sx={{ color: "white" }}
                  onClick={openReport}
                >
                  <AssignmentRoundedIcon />
                </Button>
              </>
            )}
            <Button
              variant="contained"
              color="danger"
              disabled={
                formik.isSubmitting ||
                estado != "Abierto" ||
                props.readOnly == false
              }
              sx={{ color: "white" }}
              onClick={() => setOpenDialogAnular({ state: true })}
            >
              <DoDisturbOnRoundedIcon />
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={1}>
          <Grid item md={1} xs={12}>
            <TextField
              error={Boolean(formik.touched.nronota && formik.errors.nronota)}
              fullWidth
              helperText={formik.touched.nronota && formik.errors.nronota}
              label="# Nota"
              margin="normal"
              name="nronota"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              value={formik.values.nronota}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              disabled={props.readOnly}
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <TextField
              error={Boolean(formik.touched.fecha && formik.errors.fecha)}
              fullWidth
              helperText={formik.touched.fecha && formik.errors.fecha}
              label="Fecha"
              margin="normal"
              name="fecha"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="date"
              value={formik.values.fecha}
              variant="outlined"
              focused
              disabled={props.readOnly}
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <TextField
              fullWidth
              label="Estado"
              margin="normal"
              name="estado1"
              type="text"
              value={estado}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              disabled={props.readOnly}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={11} xs={12}>
            <TextField
              error={Boolean(
                formik.touched.descripcion && formik.errors.descripcion
              )}
              fullWidth
              helperText={
                formik.touched.descripcion && formik.errors.descripcion
              }
              label="Descripción"
              margin="normal"
              name="descripcion"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              value={formik.values.descripcion}
              inputProps={{
                maxLength: 99,
              }}
              variant="outlined"
              focused
              disabled={props.readOnly}
            />
          </Grid>
          <Grid
            item
            md={1}
            xs={12}
            sx={{
              justifyContent: "end",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <Button
              sx={{ height: "56px", marginTop: "7px", width: "100%" }}
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting || props.readOnly}
              onClick={handleNuevo}
            >
              <AddToPhotosRoundedIcon />
            </Button>
          </Grid>
        </Grid>
      </form>
      <Box sx={{ height: 370, width: 1 }}>
        <DataGrid
          rows={detalles}
          columns={columns}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          hideFooterPagination
          hideFooterSelectedRowCount
          components={{
            Footer: () => <TotalesFooter detalles={detalles} />,
          }}
          rowHeight={30}
        />
      </Box>
      <AlertDialog
        open={openDialog.state}
        title={"¿Seguro que desea salir?"}
        body={"Se perderán todos los datos de esta nota de compra"}
        btnText={"Sí, Salir"}
        close={() => setOpenDialog({ state: false })}
        confirm={props.closeForm}
      />
      <AlertDialog
        open={openDialogAnular.state}
        title={"¿Seguro que desea anular esta Nota de Compra?"}
        body={
          "La nota se anulará junto con su comprobante (Si tiene habilitada la integración)"
        }
        btnText={"Anular"}
        close={() => setOpenDialogAnular({ state: false })}
        confirm={handleAnular}
      />

      <ModalForm
        open={modalform.open}
        tipo={modalform.tipo}
        datos={modalform.datos}
        close={handleCloseModal}
        articulos={modalform.tipo == "nuevo" ? _articulos : modalform.articulo}
        submit={handleSubmitDetalle}
        jwt={props.jwt}
      />
    </Box>
  );
}

const TotalesFooter = (props) => {
  var _detalles = _.cloneDeep(props.detalles);
  var datos = _detalles.map((d, i) => {
    return { subtotal: d.subtotal };
  });
  var subtotal = 0;
  if (datos.length > 0) {
    subtotal = 0;
    datos.forEach((elem) => {
      subtotal = Number(subtotal) + Number(elem.subtotal);
    });
  }

  return (
    <GridFooterContainer>
      <Stack direction="row">
        <div style={{ width: "740px", textAlign: "right" }}>
          <b>Total:</b>
        </div>
        <div style={{ width: "90px", textAlign: "right" }}>
          <b>{subtotal.toFixed(2)}</b>
        </div>
      </Stack>
    </GridFooterContainer>
  );
};
