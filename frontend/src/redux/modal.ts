import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface ModalPayload {
  dialogName: string | null;
  dialogObject: object;
}

interface ModalState {
  openModals: string[];
  dialogObjects: {
    [key: string]: object;
  };
}

const initialState = {
  openModals: [],
  dialogObjects: {},
} as ModalState;

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openDialog(state, action: PayloadAction<ModalPayload>) {
      if (action.payload.dialogName) {
        if (!state.openModals.includes(action.payload.dialogName)) {
          state.openModals.push(action.payload.dialogName);
        }
        state.dialogObjects[action.payload.dialogName] =
          action.payload.dialogObject;
      }
    },
    closeDialog(state, action?: PayloadAction<string>) {
      if (action.payload) {
        state.openModals.splice(state.openModals.indexOf(action.payload), 1);
        delete state.dialogObjects[action.payload];
      } else {
        return initialState;
      }
    },
  },
});

export const { openDialog, closeDialog } = modalSlice.actions;
export default modalSlice.reducer;
