import {SET_ERROR_STATUS, SET_LOADER_STATUS} from '../actions/types';

const initialState = {
  loader: true,
  errorMsg: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_LOADER_STATUS:
      return {...state, loader: action.payload};
    case SET_ERROR_STATUS:
      return {...state, errorMsg: action.payload};
    default:
      return {...state};
  }
}
