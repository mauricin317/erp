import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertDialog from "./AlertDialog";
import CustomTreeItem from "./CustomTreeItem";
import AddIcon from "@mui/icons-material/Add";
import BorderColorSharpIcon from "@mui/icons-material/BorderColorSharp";
import Box from "@mui/system/Box";
import TreeView from "@mui/lab/TreeView";
import _ from "lodash";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import DoDisturbOnTwoToneIcon from "@mui/icons-material/DoDisturbOnTwoTone";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";
import { useState, useEffect } from "react";
import { obtenerCategorias, eliminarCategoria } from "../services/Categorias";
import ModalForm from "./FormCategorias/ModalForm";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

var tree_util = require("tree-util");

const standardConfig = { id: "idcategoria", parentid: "idcategoriapadre" };

export default function CategoriasTreeView({ jwt }) {
  const [state, setState] = useState({
    categorias: [],
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
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(["0"]);
  const [expanded, setExpanded] = useState(["0"]);
  const [openDialog, setOpenDialog] = useState(false);

  const cargarDatos = async (firstFetch = false) => {
    setLoading(true);
    let categoria = await obtenerCategorias(jwt);
    if (categoria.ok) {
      var trees = tree_util.buildTrees(categoria.data, standardConfig);
      setState({
        categorias: trees,
      });
      if (firstFetch) handleExpandClick(trees);
    } else {
      setState({
        categorias: [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos(true);
  }, []);

  const handleExpandClick = (trees) => {
    let objNodeIds = trees[0]._nodeById;
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
    if (node) {
      setModalform({
        open: true,
        tipo: "editar",
        datos: node,
      });
    }
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
    if (node) {
      let eliminar = await eliminarCategoria(node.dataObj.idcategoria, jwt);
      if (eliminar.ok) {
        handleSubmit();
      } else {
        toast.error(eliminar.mensaje, { theme: "colored" });
      }
    }
    handleSelect(null, "0");
  };

  const handleSubmit = () => {
    cargarDatos();
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
            color="success"
            size="large"
            variant="contained"
            onClick={handleNuevo}
          >
            Crear
            <AddIcon />
          </Button>

          <Button
            color="secondary"
            size="large"
            variant="contained"
            disabled={disabled.edit}
            onClick={handleEditar}
          >
            Editar
            <BorderColorSharpIcon />
          </Button>

          <Button
            disabled={disabled.delete || loading}
            variant="contained"
            color="error"
            onClick={() => setOpenDialog(true)}
          >
            Borrar
            <DeleteIcon />
          </Button>
        </Stack>
      </Stack>
      <TreeView
        selected={selected}
        onNodeSelect={handleSelect}
        defaultCollapseIcon={<DoDisturbOnTwoToneIcon color="error" />}
        expanded={expanded}
        onNodeToggle={handleToggle}
        defaultExpandIcon={<AddCircleTwoToneIcon color="secondary" />}
        sx={{
          maxHeight: 500,
          marginLeft: "50px",
          flexGrow: 1,
          maxWidth: "100%",
          overflowY: "auto",
        }}
        defaultEndIcon={<FiberManualRecordOutlinedIcon color="info" />}
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
