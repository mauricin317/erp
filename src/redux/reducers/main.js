import * as t from "../types"


const main = (state = {
        name: "guest"
}, action) =>{
    switch(action.type){
        case t.SET_NAME:
            return { ...state, userInfo:{
                name: action.payload
            } };
        default:
            return {...state};
    }
}


export default main;