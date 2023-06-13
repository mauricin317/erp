import { TextField, Box, Grid, Button, Autocomplete } from "@mui/material";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
  obtenerArticulos,
  obtenerArticulosBajoStock,
} from "../../services/Dashboard";

export default function LowStockChart({ jwt }) {
  const [state, setState] = useState({
    datos: [],
    categorias: [],
  });

  const cargarDatos = async () => {
    let datos = await obtenerArticulos(jwt);
    if (datos.ok) {
      setState({
        datos: datos.data,
        categorias: datos.categorias,
      });
    } else {
      setState({
        datos: datos.data,
        categorias: datos.categorias,
      });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (idcategoria, cantidad) => {
    let lsdatos = await obtenerArticulosBajoStock(idcategoria, cantidad, jwt);
    if (lsdatos.ok) {
      setState({
        datos: lsdatos.data,
        categorias: state.categorias,
      });
    }
  };

  return (
    <Box
      mb={2}
      sx={{
        width: "100%",
        height: "500px",
        boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.2)",
      }}
    >
      <FormLowStock
        categorias={state.categorias}
        submit={handleSubmit}
        cancelar={cargarDatos}
      />
      <ResponsiveContainer width="100%" height={"80%"}>
        <BarChart
          width={500}
          data={state.datos}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="nombre"
            label={{ value: "Articulos", position: "bottom" }}
          />
          <YAxis
            label={{ value: "Cantidad", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip categorias={state.categorias} />} />
          <Legend verticalAlign="top" height={36} />
          <Bar
            dataKey="cantidad"
            name="Cantidad"
            legendType="rect"
            fill="#00c292"
          >
            <LabelList dataKey="cantidad" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
//content={<CustomTooltip />}

const CustomTooltip = ({ active, payload, label, categorias }) => {
  if (active && payload && payload.length) {
    let _categorias = _.filter(categorias, function (value) {
      if (_.includes(payload[0].payload.categorias, value.idcategoria))
        return value;
    });
    return (
      <div
        className="recharts-default-tooltip"
        style={{
          margin: "0px",
          padding: "10px",
          backgroundColor: "rgb(255, 255, 255)",
          border: "1px solid rgb(204, 204, 204)",
          whiteSpace: "nowrap",
        }}
      >
        <p
          className="recharts-tooltip-label"
          style={{ margin: "0px" }}
        >{`${label}`}</p>
        <ul
          className="recharts-tooltip-item-list"
          style={{ padding: "0px", margin: "0px" }}
        >
          <li
            className="recharts-tooltip-item"
            style={{
              display: "block",
              paddingTop: "4px",
              paddingBottom: "4px",
            }}
          >
            <span>{`Cantidad: `}</span>
            <span
              style={{ color: "rgb(0, 194, 146)" }}
            >{` ${payload[0].value}`}</span>
          </li>
        </ul>
        <p
          className="recharts-tooltip-label"
          style={{ margin: "0px", padding: "0px" }}
        >
          <span>{"Categorias: "}</span>
          <span style={{ color: "#fb9678" }}>{`${_.join(
            _.map(_categorias, "nombre"),
            ", "
          )}`}</span>
        </p>
      </div>
    );
  }

  return null;
};

function FormLowStock(props) {
  const [categoria, setCateoria] = useState(null);
  const [cantidad, setCantidad] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    props.submit(categoria.idcategoria, cantidad);
  };

  const handleCancelar = () => {
    setCateoria(null);
    setCantidad(0);
    props.cancelar();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ height: "20%" }}
      >
        <Grid item md={4} xs={6}>
          <Autocomplete
            id="combo-box-demo"
            name="categoria"
            options={props.categorias}
            value={categoria}
            size="small"
            getOptionLabel={(option) => option.nombre}
            onChange={(event, newValue) => setCateoria(newValue)}
            renderInput={(params) => (
              <TextField
                fullWidth
                label="Categoria"
                margin="normal"
                type="text"
                variant="outlined"
                focused
                required
                {...params}
              />
            )}
          />
        </Grid>
        <Grid item md={2} xs={3}>
          <TextField
            fullWidth
            label="Cantidad Max."
            margin="normal"
            name="cantidad"
            type="number"
            focused
            required
            size="small"
            onChange={(e) => setCantidad(e.target.value)}
            value={cantidad}
            variant="outlined"
            inputProps={{
              min: 1,
            }}
          />
        </Grid>
        <Grid item md={1} xs={1}>
          <Button
            sx={{ marginTop: "7px"}}
            variant="contained"
            color="primary"
            type="submit"
          >
            <SearchRoundedIcon />
          </Button>
        </Grid>
        <Grid item md={1} xs={1}>
          <Button
            sx={{
              marginTop: "7px",
              color: "white",
            }}
            variant="contained"
            color="danger"
            type="button"
            onClick={handleCancelar}
          >
            <CancelRoundedIcon />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
