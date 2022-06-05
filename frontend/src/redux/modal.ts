import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface ModalState {
  dialogName: string | null;
  dialogObject: object;
}

const initialState = { dialogName: null, dialogObject: {} } as ModalState;

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showDialog(state, action: PayloadAction<ModalState>) {
      return action.payload;
    },
    hideDialog(state) {
      return initialState;
    },
  },
});

export const { showDialog, hideDialog } = modalSlice.actions;
export default modalSlice.reducer;
