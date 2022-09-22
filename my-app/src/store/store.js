import { configureStore } from '@reduxjs/toolkit';
//import counterReducer from '../features/counter/counterSlice';
import reducer  from './reducer';
export const store = configureStore({
reducer:reducer
})
export default store;