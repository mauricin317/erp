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
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import DoDisturbOnTwoToneIcon from '@mui/icons-material/DoDisturbOnTwoTone';
import FiberManualRecordOutlinedIcon from '@mui/icons-material/FiberManualRecordOutlined';
import { useState, useEffect } from 'react';
import ModalForm from './FormCuentas/ModalForm';
import { toast } from 'react-toastify';
import { obtenerCuentas, eliminarCuenta } from '../services/Cuentas';
import 'react-toastify/dist/ReactToastify.min.css';
import tree_util from 'tree-util'

  var standardConfig =  { id : 'idcuenta', parentid : 'idcuentapadre'};

export default function CuentasTreeView(props){

    const [state, setState] = useState({
        cuentas:[],
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
      const [loading, setLoading] = useState(false);
      const [selected, setSelected] = useState(["0"]);
      const [expanded, setExpanded] = useState(["0"]);
      const [openDialog, setOpenDialog] = useState(false);


      const cargarDatos= async () =>{
        setLoading(true)
        let cuentas = await obtenerCuentas(props.jwt);
        if(cuentas.ok){
          var trees = tree_util.buildTrees(cuentas.data, standardConfig);
          setState({
            cuentas: trees,
            niveles: cuentas.niveles,
            idempresa: cuentas.idempresa
          })
        }else{
          setState({
            cuentas: [],
            niveles: cuentas.niveles,
            idempresa: cuentas.idempresa
          })

        }
        setLoading(false)
      }

      useEffect(()=>{
        cargarDatos();
      },[])

      const handleExpandClick = () => {
        let objNodeIds = state.cuentas[0]._nodeById
        let _arrNodeIds = _.keys(objNodeIds);
        _arrNodeIds.map((n, i) =>{
          return n.toString();
        })
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
        if(node){
          setModalform({
            open:true,
            tipo:'editar',
            datos: node
          });  
        }
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
        if(node){
          let eliminar = await eliminarCuenta(node.dataObj.idcuenta, props.jwt);
          if(eliminar.ok){
            handleSubmit();
          }else{
            toast.error(eliminar.mensaje,{theme: "colored"});
          }
        }
        handleSelect(null,"0")
      }

      const handleSubmit = (cuenta) =>{
        cargarDatos();
        setOpenDialog(false);
        if(cuenta){
          setExpanded((oldExpanded) =>
            _.concat(oldExpanded,[(cuenta.id).toString()])
          );
        }
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
       // window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FPlanCuentas&standAlone=true&id_empresa=${state.idempresa}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
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
                <Button disabled={disabled.delete || loading} variant="contained" color="error" onClick={() => setOpenDialog(true)}><DeleteIcon/></Button>
                <Button variant="contained" color="secondary" onClick={handleReport} ><AssignmentRoundedIcon/></Button>
            </Stack>
            
        </Stack>
        <Button sx={{m:1}} variant="outlined" size="small" color="secondary" onClick={handleExpandClick}>
          {expanded.length === 1 ? <><AddCircleTwoToneIcon />Expandir Todos</> : <><DoDisturbOnTwoToneIcon />Cerrar todos</>}
        </Button>
        <TreeView aria-label="file system navigator" selected={selected} onNodeSelect={handleSelect} defaultCollapseIcon={<DoDisturbOnTwoToneIcon color='error' />} expanded={expanded} onNodeToggle={handleToggle} defaultExpandIcon={<AddCircleTwoToneIcon color='secondary' />} sx={{ maxHeight:680, marginLeft: '50px', flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }} defaultEndIcon={<FiberManualRecordOutlinedIcon color='info' />} >
        <CustomTreeItem key={"0"} nodeId={"0"} label={`Plan de Cuentas`}>
            {state.cuentas.map((tree) => renderTree(tree.rootNode))}
        </CustomTreeItem>
        </TreeView>
        <AlertDialog open={openDialog} title={"¿Seguro que desea eliminar esta cuenta?"} body={"La cuenta se eliminará de forma permanente"} btnText={"Eliminar"} close={() => setOpenDialog(false)} confirm={handleEliminar} />
        <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} niveles={state.niveles} close={handleCloseModal} submit={handleSubmit} jwt={props.jwt} />
    </Box>
    )
};