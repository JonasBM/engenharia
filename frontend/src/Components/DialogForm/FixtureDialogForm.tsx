export {};

// import * as yup from "yup";

// import { Controller, useForm, useWatch } from "react-hook-form";
// import {
//   FixtureSerializer,
//   fixtureType,
//   fixtureTypes,
// } from "api/types/shpTypes";
// import { MenuItem, TextField } from "@mui/material";
// import React, { useEffect } from "react";
// import { hideDialog, showDialog } from "redux/modal";
// import { useAppDispatch, useAppSelector } from "redux/utils";

// import BaseDialogForm from "./BaseDialogForm";
// import { FixtureCRUDAction } from "api/shp";
// import { addServerErrors } from "utils";
// import store from "redux/store";
// import { yupResolver } from "@hookform/resolvers/yup";

// const _newFixture: FixtureSerializer = {
//   id: 0,
//   name: "",
//   nozzle_type: "",
//   extra_equivalent_length: null,
//   hose_hazen_williams_coefficient: null,
//   hose_internal_diameter: null,
//   k_factor: null,
//   outlet_diameter: null,
//   minimum_flow_rate: null,
//   material: null,
//   inlet_diameter: null,
//   reductions: [],
//   fittings: [],
// };

// const _dialogName = "MODAL_FIXTURE";

// export const showFixtureDialog = (
//   _dialogObject?: Partial<FixtureSerializer>
// ) => {
//   store.dispatch(
//     showDialog({
//       dialogName: _dialogName,
//       dialogObject: { ..._newFixture, ..._dialogObject },
//     })
//   );
// };

// export const closeFixtureDialog = () => {
//   store.dispatch(hideDialog());
// };

// export const destroyFixture = (_fixture: FixtureSerializer) => {
//   if (_fixture && _fixture.id) {
//     let newLine = "\r\n";
//     let confirm_alert = "Tem certeza que deseja remover este Hidrante?";
//     confirm_alert += newLine;
//     confirm_alert += _fixture.name;
//     if (window.confirm(confirm_alert)) {
//       store.dispatch(FixtureCRUDAction.destroy(_fixture.id));
//       return true;
//     }
//   }
//   return false;
// };

// const validationSchema = () =>
//   yup
//     .object({
//       name: yup.string().max(255).required(),
//       type: yup.string().required(),
//       hose_hazen_williams_coefficient: yup.number().integer().min(0).required(),
//       hose_internal_diameter: yup.number().integer().min(0).required(),
//       // k_factor: null,
//       outlet_diameter: yup.number().min(1).required(),
//       minimum_flow_rate: yup.number().min(0).required(),
//     })
//     .required();

// const FixtureDialogForm = () => {
//   const dispatch = useAppDispatch();
//   const materials = useAppSelector((state) => state.shp.materials);
//   const diameters = useAppSelector((state) =>
//     [...state.shp.diameters].sort(
//       (a, b) => a.internal_diameter - b.internal_diameter
//     )
//   );
//   const reductions = useAppSelector((state) =>
//     [...state.shp.reductions].sort((a, b) => a.name.localeCompare(b.name))
//   );
//   const fittings = useAppSelector((state) => state.shp.fittings);
//   const { dialogName, dialogObject } = useAppSelector(
//     (state) => state.modal
//   ) as {
//     dialogName: string | null;
//     dialogObject: FixtureSerializer;
//   };
//   const {
//     register,
//     control,
//     handleSubmit,
//     reset,
//     setError,
//     setValue,
//     formState: { errors },
//   } = useForm<FixtureSerializer>({
//     resolver: yupResolver(validationSchema()),
//     defaultValues: dialogObject,
//   });
//   const material_id = useWatch({ control, name: "material" });
//   const nozzle_type = useWatch({ control, name: "nozzle_type" });

//   useEffect(() => {
//     setValue("inlet_diameter", null, { shouldValidate: true });
//     setValue("reductions", [], { shouldValidate: true });
//   }, [material_id, setValue]);

//   useEffect(() => {
//     reset(dialogObject);
//   }, [dialogObject, reset]);

//   const handleCreate = (_fixture: FixtureSerializer) => {
//     dispatch(FixtureCRUDAction.create(_fixture))
//       .then((res) => {
//         handleClose();
//       })
//       .catch((errors) => {
//         addServerErrors(errors.response.data, setError);
//       });
//   };

//   const handleUpdate = (_fixture: FixtureSerializer) => {
//     dispatch(FixtureCRUDAction.partialUpdate(_fixture))
//       .then((res) => {
//         handleClose();
//       })
//       .catch((errors) => {
//         addServerErrors(errors.response.data, setError);
//       });
//   };

//   const handleDestroy = () => {
//     if (destroyFixture(dialogObject)) {
//       handleClose();
//     }
//   };

//   const onSubmit = (data: FixtureSerializer) => {
//     if (data.id) {
//       handleUpdate(data);
//     } else {
//       handleCreate(data);
//     }
//   };

//   const handleReset = () => {
//     reset();
//   };

//   const handleClose = () => {
//     closeFixtureDialog();
//   };

//   return (
//     <BaseDialogForm
//       key={dialogObject.id}
//       open={dialogName === _dialogName ? true : false}
//       title={dialogObject.id ? "Editar Hidrante" : "Criar Hidrante"}
//       onClose={handleClose}
//       onSubmit={handleSubmit(onSubmit)}
//       onReset={handleReset}
//       onDelete={dialogObject.id ? handleDestroy : null}
//     >
//       <TextField
//         label="Nome"
//         error={errors.name ? true : false}
//         helperText={errors.name?.message}
//         {...register("name")}
//       />
//       {fixtureTypes.length > 0 && (
//         <Controller
//           control={control}
//           name="nozzle_type"
//           render={({ field: { value, onChange } }) => (
//             <TextField
//               select
//               label="Tipo de hidrante"
//               value={value || ""}
//               onChange={(event) => {
//                 onChange(event.target.value);
//               }}
//               error={errors.nozzle_type ? true : false}
//               helperText={errors.nozzle_type?.message}
//             >
//               {fixtureTypes.map((_type) => (
//                 <MenuItem key={_type.value} value={_type.value}>
//                   {_type.name}
//                 </MenuItem>
//               ))}
//             </TextField>
//           )}
//         />
//       )}

//       {nozzle_type !== fixtureType.TRONCO_CONICO.value && (
//         <TextField
//           type="number"
//           inputProps={{ step: "0.01" }}
//           label="Fator K"
//           error={errors.k_factor ? true : false}
//           helperText={errors.k_factor?.message}
//           {...register("k_factor")}
//         />
//       )}

//       <TextField
//         type="number"
//         inputProps={{ step: "0.01" }}
//         label="Diâmetro da saída do esguicho (mm)"
//         error={errors.outlet_diameter ? true : false}
//         helperText={errors.outlet_diameter?.message}
//         {...register("outlet_diameter")}
//       />
//       <TextField
//         type="number"
//         inputProps={{ step: "0.01" }}
//         label="Vazão mínima (l/min)"
//         error={errors.minimum_flow_rate ? true : false}
//         helperText={errors.minimum_flow_rate?.message}
//         {...register("minimum_flow_rate")}
//       />
//       <TextField
//         type="number"
//         inputProps={{ step: "1" }}
//         label="Coeficiente de hazen-williams da mangueira"
//         error={errors.hose_hazen_williams_coefficient ? true : false}
//         helperText={errors.hose_hazen_williams_coefficient?.message}
//         {...register("hose_hazen_williams_coefficient")}
//       />

//       <TextField
//         type="number"
//         inputProps={{ step: "1" }}
//         label="Diâmetro interno da mangueira (mm)"
//         error={errors.hose_internal_diameter ? true : false}
//         helperText={errors.hose_internal_diameter?.message}
//         {...register("hose_internal_diameter")}
//       />

//       {materials.length > 0 && (
//         <Controller
//           control={control}
//           name="material"
//           render={({ field: { value, onChange } }) => (
//             <TextField
//               select
//               label="Material"
//               value={value || ""}
//               onChange={(event) => {
//                 onChange(event.target.value);
//               }}
//               error={errors.material ? true : false}
//               helperText={errors.material?.message}
//             >
//               <MenuItem value={""}>Sem Material</MenuItem>
//               {materials.map((_material) => (
//                 <MenuItem key={_material.id} value={_material.id}>
//                   {_material.name}
//                 </MenuItem>
//               ))}
//             </TextField>
//           )}
//         />
//       )}

//       {diameters.length > 0 && (
//         <Controller
//           control={control}
//           name="inlet_diameter"
//           render={({ field: { value, onChange } }) => (
//             <TextField
//               select
//               label="Diâmetro de entrada"
//               value={value || ""}
//               onChange={(event) => {
//                 onChange(event.target.value);
//               }}
//               error={errors.inlet_diameter ? true : false}
//               helperText={errors.inlet_diameter?.message}
//             >
//               <MenuItem value={""}>Sem Diâmetro de entrada</MenuItem>
//               {diameters.map((_diameter) => (
//                 <MenuItem
//                   key={_diameter.id}
//                   value={_diameter.id}
//                   sx={{
//                     display: _diameter.material === material_id ? "" : "none",
//                   }}
//                 >
//                   {_diameter.name} ({_diameter.internal_diameter} mm)
//                 </MenuItem>
//               ))}
//             </TextField>
//           )}
//         />
//       )}

//       {reductions.length > 0 && (
//         <Controller
//           control={control}
//           name="reductions"
//           render={({ field: { value, onChange } }) => (
//             <TextField
//               select
//               SelectProps={{
//                 multiple: true,
//               }}
//               label="Reduções"
//               value={value || []}
//               onChange={(event) => {
//                 onChange(event.target.value || []);
//               }}
//               error={errors.reductions ? true : false}
//               helperText={errors.reductions?.join(", ")}
//             >
//               {reductions.map((_reduction) => (
//                 <MenuItem
//                   key={_reduction.id}
//                   value={_reduction.id}
//                   sx={{
//                     display: _reduction.material === material_id ? "" : "none",
//                   }}
//                 >
//                   {_reduction.name}
//                 </MenuItem>
//               ))}
//             </TextField>
//           )}
//         />
//       )}

//       {fittings.length > 0 && (
//         <Controller
//           control={control}
//           name="fittings"
//           render={({ field: { value, onChange } }) => (
//             <TextField
//               select
//               SelectProps={{
//                 multiple: true,
//               }}
//               label="Conexões"
//               value={value || []}
//               onChange={(event) => {
//                 onChange(event.target.value || []);
//               }}
//               error={errors.fittings ? true : false}
//               helperText={errors.fittings?.join(", ")}
//             >
//               {fittings.map((_fitting) => (
//                 <MenuItem key={_fitting.id} value={_fitting.id}>
//                   {_fitting.name}
//                 </MenuItem>
//               ))}
//             </TextField>
//           )}
//         />
//       )}

//       <TextField
//         type="number"
//         inputProps={{ step: "0.01" }}
//         label="Comprimento equivalente extra (m)"
//         error={errors.extra_equivalent_length ? true : false}
//         helperText={errors.extra_equivalent_length?.message}
//         {...register("extra_equivalent_length")}
//       />
//     </BaseDialogForm>
//   );
// };

// export default FixtureDialogForm;
