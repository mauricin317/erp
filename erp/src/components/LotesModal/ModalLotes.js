import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import LotesDataGrid from './LotesDatagrid';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '70%',
  bgcolor: 'background.paper',
  border: '2px solid #333',
  boxShadow: 24,
  p: 4,
};

export default function ModalLotes(props) {

  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.close}
        aria-labelledby="modal-modal-lotes"
        aria-describedby="modal-modal-description"
        sx={{overflow: 'auto'}}
      >
        <Box sx={style}>
        <LotesDataGrid close={props.close} data={props.data} />
        </Box>
      </Modal>
    </div>
  );
}