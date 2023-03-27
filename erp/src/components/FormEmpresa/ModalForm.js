import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import FormEmpresa from './FormEmpresa';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
 width:'50%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  px: 0,
};

export default function ModalForm(props) {

  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{overflow: 'auto'}}
      >
        <Box sx={style}>
        <FormEmpresa close={props.close} tipo={props.tipo} datos={props.datos} submit={props.submit} monedas={props.monedas} jwt={props.jwt} />
        </Box>
      </Modal>
    </div>
  );
}