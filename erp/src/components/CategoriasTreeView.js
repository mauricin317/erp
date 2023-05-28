import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AlertDialog from "./AlertDialog";
import CustomTreeItem from "./CustomTreeItem";
import Box from "@mui/system/Box";
import TreeView from "@mui/lab/TreeView";
import _ from "lodash";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import { useState } from "react";
import { obtenerCategorias, eliminarCategoria } from "../services/Categorias";
import ModalForm from "./FormCategorias/ModalForm";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

var tree_util = require("tree-util");

const standardConfig = { id: "idcategoria", parentid: "idcategoriapadre" };

export default function CategoriasTreeView({ jwt }) {
  const [state, setState] = useState({
    categorias: [],
    isfetched: false,
  });
  const [disabled, setDisabled] = useState({
    new: false,
    edit: true,
    delete: true,
  });
  const [modalform, setModalform] = useState({
    open: false,
    tipo: "nuevo",
    datos: null,
  });
  const [selected, setSelected] = useState(["0"]);
  const [expanded, setExpanded] = useState(["0"]);
  const [openDialog, setOpenDialog] = useState(false);

  const cargarDatos = async () => {
    let categoria = await obtenerCategorias(jwt);
    if (categoria.ok) {
      var trees = tree_util.buildTrees(categoria.data, standardConfig);
      setState({
        categorias: trees,
        isfetched: true,
      });
    } else {
      setState({
        categorias: [],
        isfetched: true,
      });
    }
  };

  if (!state.isfetched) {
    cargarDatos();
  }

  const handleExpandClick = () => {
    let objNodeIds = state.categorias[0]._nodeById;
    let _arrNodeIds = _.keys(objNodeIds);
    _arrNodeIds.map((n, i) => {
      return n.toString();
    });
    setExpanded((oldExpanded) =>
      oldExpanded.length === 1 ? _.concat(_arrNodeIds, ["0"]) : ["0"]
    );
  };

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleNuevo = () => {
    let node;
    if (selected != "0") {
      node = state.categorias[0].getNodeById(selected);
    } else {
      node = undefined;
    }
    setModalform({
      open: true,
      tipo: "nuevo",
      datos: node,
    });
  };
  const handleEditar = () => {
    let node = state.categorias[0].getNodeById(selected);
    setModalform({
      open: true,
      tipo: "editar",
      datos: node,
    });
  };
  const handleCloseModal = () => {
    setModalform({
      open: false,
      tipo: "nuevo",
      datos: null,
    });
  };
  const handleEliminar = async () => {
    let node = state.categorias[0].getNodeById(selected);
    let eliminar = await eliminarCategoria(node.dataObj.idcategoria, jwt);
    if (eliminar.ok) {
      handleSubmit();
    } else {
      toast.error(eliminar.mensaje, { theme: "colored" });
    }
  };

  const handleSubmit = () => {
    setState({
      categorias: state.categorias,
      isfetched: false,
    });
    setOpenDialog(false);
  };

  const handleSelect = (event, nodeId) => {
    setSelected(nodeId);

    if (nodeId === "0") {
      setDisabled({ new: false, edit: true, delete: true });
    } else {
      let node = state.categorias[0].getNodeById(nodeId);
      setDisabled({
        new: false,
        edit: false,
        delete: node.children.length > 0,
      });
    }
  };

  const renderTree = (node) => (
    <CustomTreeItem
      key={node.id}
      nodeId={node.id + ""}
      label={node.dataObj.nombre}
    >
      {Array.isArray(node.children)
        ? node.children.map((node) => renderTree(node))
        : null}
    </CustomTreeItem>
  );

  return (
    <Box
      sx={{
        width: 1,
      }}
    >
      <Stack
        sx={{ mb: 3 }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" spacing={1}>
          <Button
            disabled={disabled.new}
            variant="contained"
            color="primary"
            onClick={handleNuevo}
          >
            <AddCircleRoundedIcon />
          </Button>
          <Button
            disabled={disabled.edit}
            variant="contained"
            color="info"
            onClick={handleEditar}
          >
            <EditRoundedIcon sx={{ color: "white" }} />
          </Button>
          <Button
            disabled={disabled.delete}
            variant="contained"
            color="error"
            onClick={() => setOpenDialog(true)}
          >
            <DeleteIcon />
          </Button>
        </Stack>
      </Stack>
      <Button
        sx={{ m: 1 }}
        variant="outlined"
        size="small"
        color="secondary"
        disabled={state.categorias.length <= 0}
        onClick={handleExpandClick}
      >
        {expanded.length === 1 ? (
          <>
            <AddBoxOutlinedIcon />
            Expandir Todos
          </>
        ) : (
          <>
            <IndeterminateCheckBoxOutlinedIcon />
            Cerrar todos
          </>
        )}
      </Button>
      <TreeView
        aria-label="file system navigator"
        selected={selected}
        onNodeSelect={handleSelect}
        defaultCollapseIcon={<IndeterminateCheckBoxOutlinedIcon />}
        expanded={expanded}
        onNodeToggle={handleToggle}
        defaultExpandIcon={<AddBoxOutlinedIcon />}
        sx={{
          maxHeight: 430,
          marginLeft: "50px",
          flexGrow: 1,
          maxWidth: "100%",
          overflowY: "auto",
        }}
      >
        <CustomTreeItem key={"0"} nodeId={"0"} label={`Categorias`}>
          {state.categorias.map((tree) => renderTree(tree.rootNode))}
        </CustomTreeItem>
      </TreeView>
      <AlertDialog
        open={openDialog}
        title={"¿Seguro que desea eliminar esta Categoría?"}
        body={"La categoría se eliminará de forma permanente"}
        btnText={"Eliminar"}
        close={() => setOpenDialog(false)}
        confirm={handleEliminar}
      />
      <ModalForm
        open={modalform.open}
        tipo={modalform.tipo}
        datos={modalform.datos}
        close={handleCloseModal}
        submit={handleSubmit}
        jwt={jwt}
      ></ModalForm>
    </Box>
  );
}
