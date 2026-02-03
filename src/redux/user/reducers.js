import { CLEAR_USER, SET_USER } from "./actions";

// Gets called every time dispatch function is called
// Irrespective of the action type and payload
export const userReducer = (state = null, action) => {
  switch (action.type) {
    // This case helps us to set the user data when the user logs in
    case SET_USER:
      return action.payload;
    // This case helps us to clear the user data when the user logs out
    case CLEAR_USER:
      return null;
    // This case helps us to update the user data when the user updates their details
    default:
      return state;
  }
};
