import { CLEAR_USER,SET_USER } from "./action";
//gets called eveytims diapatch function is called
// Irrespective of the action and paylaod.
export const userReducer = (state = null, action ) => {
switch (action.type){
    //This action helps in login functionality.
    case SET_USER:
        return action.payload;
    //this cases helps in logout functionality.
    case CLEAR_USER:
        return null;
    // This case helps in handling cases where userReducer
    //is involved due to changes in some other satate varibale
    //maintained by redux.
    default:
        return state;
}
};