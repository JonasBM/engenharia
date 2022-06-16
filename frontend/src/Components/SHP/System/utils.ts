export const flow_to_l_p_min = (flow: number): number => {
  if (typeof flow === "number") {
    return flow * 60000;
  }
  return flow;
};
