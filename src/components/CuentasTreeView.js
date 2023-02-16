import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import AlertDialog from './AlertDialog';
import CustomTreeItem from './CustomTreeItem'
import Box from '@mui/system/Box';
import TreeView from '@mui/lab/TreeView';
import _ from 'lodash';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import { useState } from 'react';
import ModalForm from './FormCuentas/ModalForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
var tree_util = require('tree-util')

async function obtenerCuentas() {
    return fetch('http://localhost:3000/api/cuentas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(result => result.json())
   }

async function eliminarCuenta(idcuenta) {
    return fetch(`http://localhost:3000/api/cuentas/${idcuenta}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(result => result.json())
   }

   var standardConfig =  { id : 'idcuenta', parentid : 'idcuentapadre'};







export default function CuentasTreeView(){

    const [state, setState] = useState({
        cuentas:[],
        isfetched: false,
        niveles: 0,
        idempresa: 0
      });
      const[disabled, setDisabled] = useState({
        new: false,
        edit: true,
        delete: true
      });
      const [modalform, setModalform] = useState({
        open:false,
        tipo:'nuevo',
        datos:null
      });
      const [selected, setSelected] = useState(["0"]);
      const [expanded, setExpanded] = useState(["0"]);
      const [openDialog, setOpenDialog] = useState(false);


      const cargarDatos= async () =>{
        let cuentas = await obtenerCuentas();
        if(cuentas.ok){
          var trees = tree_util.buildTrees(cuentas.data, standardConfig);
          setState({
            cuentas: trees,
            isfetched: true,
            niveles: cuentas.niveles,
            idempresa: cuentas.idempresa
          })
        }else{
          setState({
            cuentas: [],
            isfetched: true,
            niveles: cuentas.niveles,
            idempresa: cuentas.idempresa
          })

        }
      }

      if(!state.isfetched){
        cargarDatos();
      }

      const handleExpandClick = () => {
        let objNodeIds = state.cuentas[0]._nodeById
        let _arrNodeIds = _.keys(objNodeIds);
        console.log("ARR",_arrNodeIds);
        _arrNodeIds.map((n, i) =>{
          return n.toString();
        })
        console.log("Expanded", expanded);
        setExpanded((oldExpanded) =>
          oldExpanded.length === 1 ? _.concat(_arrNodeIds,["0"]) : ["0"],
        );
      };

      const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
      };

      const handleNuevo = () => {
        let node;
        if(selected != "0"){
          node = state.cuentas[0].getNodeById(selected);
        }else{
          node = undefined;
        }
        setModalform({
          open:true,
          tipo:'nuevo',
          datos: node
        });
      };
      const handleEditar = () =>{
        let node = state.cuentas[0].getNodeById(selected)
        setModalform({
          open:true,
          tipo:'editar',
          datos: node
        });
      }
      const handleCloseModal = () => {
        setModalform({
          open:false,
          tipo:'nuevo',
          datos:null
        });
      };
      const handleEliminar = async () => {
        let node = state.cuentas[0].getNodeById(selected)
        let eliminar = await eliminarCuenta(node.dataObj.idcuenta);
        if(eliminar.ok){
          handleSubmit();
        }else{
          toast.error(eliminar.mensaje,{theme: "colored"});
        }
      }

      const handleSubmit = () =>{
        setState({
          cuentas:state.cuentas,
          isfetched: false,
          niveles: state.niveles,
          idempresa: state.idempresa
        })
        setOpenDialog(false);
      }

      const handleSelect = (event, nodeId) => {
        setSelected(nodeId);
        
        if(nodeId === "0"){
          setDisabled({new: false,edit: true,delete: true})
        }else{
          let node = state.cuentas[0].getNodeById(nodeId)
          setDisabled({new: node.dataObj.tipocuenta===1,edit: false, delete: node.children.length > 0})
        }
      };

      const handleReport= () =>{
        window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FPlanCuentas&standAlone=true&id_empresa=${state.idempresa}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
      }
      

      
      const renderTree = (node) => (
        <CustomTreeItem key={node.id} nodeId={node.id+""} label={`${node.dataObj.codigo} - ${node.dataObj.nombre}`}>
          {Array.isArray(node.children)
            ? node.children.map((node) => renderTree(node))
            : null}
        </CustomTreeItem>
      );

    return(
        <Box sx={
          { 
            width: 1
          }
        }>
        <Stack sx={{mb:3}} direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
                <Button disabled={disabled.new} variant="contained" color="primary" onClick={handleNuevo}><AddCircleRoundedIcon/></Button>
                <Button disabled={disabled.edit} variant="contained" color="info" onClick={handleEditar}><EditRoundedIcon sx={{color:'white'}}/></Button>
                <Button disabled={disabled.delete} variant="contained" color="error" onClick={() => setOpenDialog(true)}><DeleteIcon/></Button>
                <Button variant="contained" color="secondary" onClick={handleReport} ><AssignmentRoundedIcon/></Button>
            </Stack>
            
        </Stack>
        <Button sx={{m:1}} variant="outlined" size="small" color="secondary" onClick={handleExpandClick}>
          {expanded.length === 1 ? <><AddBoxOutlinedIcon />Expandir Todos</> : <><IndeterminateCheckBoxOutlinedIcon />Cerrar todos</>}
        </Button>
        <TreeView aria-label="file system navigator" selected={selected} onNodeSelect={handleSelect} defaultCollapseIcon={<IndeterminateCheckBoxOutlinedIcon />} expanded={expanded} onNodeToggle={handleToggle} defaultExpandIcon={<AddBoxOutlinedIcon />} sx={{ maxHeight: 430, marginLeft: '50px', flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }} >
        <CustomTreeItem key={"0"} nodeId={"0"} label={`Plan de Cuentas`}>
            {state.cuentas.map((tree) => renderTree(tree.rootNode))}
        </CustomTreeItem>
        </TreeView>
        <AlertDialog open={openDialog} title={"¿Seguro que desea eliminar esta cuenta?"} body={"La cuenta se eliminará de forma permanente"} btnText={"Eliminar"} close={() => setOpenDialog(false)} confirm={handleEliminar} />
        <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} niveles={state.niveles} close={handleCloseModal} submit={handleSubmit}></ModalForm>
    </Box>
    )
};