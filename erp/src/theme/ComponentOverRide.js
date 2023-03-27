const components = {
  MuiCssBaseline: {
    styleOverrides: {
      "*": {
        boxSizing: "border-box",
      },
      html: {
        height: "100%",
        width: "100%",
      },
      body: {
        height: "100%",
        margin: 0,
        padding: 0,
      },
      "#root": {
        height: "100%",
      },
      "*[dir='rtl'] .buyNowImg": {
        transform: "scaleX(-1)",
      },

      ".buyNowImg": {
        position: "absolute",
        right: "-44px",
        top: "-18px",
        width: "143px",
        height: "175px",
      },
      ".MuiCardHeader-action": {
        alignSelf: "center !important",
      },
      ".scrollbar-container": {
        borderRight: "0 !important",
      },
      "*[dir='rtl'] .welcomebg:before": {
        backgroundPosition: "top -24px left -9px !important",
      },
    },
  },
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: "15px !important",
        paddingRight: "15px !important",
        maxWidth: "1600px",
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        boxShadow: "none",

        "&:hover": {
          boxShadow: "none",
        },
      },
    },
  },

  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: "3px",
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "20px",
        padding: "14px",
        margin: "15px",
        boxShadow: "0px 7px 30px 0px rgba(90, 114, 123, 0.11)",
      },
    },
  },

  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: "40px",
      },
    },
  },

  MuiGridItem: {
    styleOverrides: {
      root: {
        paddingTop: "30px",
        paddingLeft: "30px !important",
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        backgroundColor: "#ecf0f2",
        borderRadius: "6px",
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: "3px",
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: "500",
        fontSize: "0.75rem",
      },
    },
  },
  MuiDataGrid: {
    styleOverrides: {
      root: {
        //backgroundColor: 'red',
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#37474f',
          border: '1px',
          color: 'white'

        },
        '& .MuiDataGrid-columnHeaderTitle':{
          fontWeight : 'bold',
          
        },
        '& .MuiDataGrid-row:nth-of-type(odd)': {
          backgroundColor: '#eee',
        }
      }
    }
  }
  
};

export default components;
