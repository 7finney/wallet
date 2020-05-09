import { SET_AUTH_TOKEN } from '../actions/types';

const initialState = {
  token: undefined,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return { ...state, token: action.payload };
    default:
      return { ...state };
  }
};
