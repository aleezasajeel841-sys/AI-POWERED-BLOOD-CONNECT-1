import { useContext } from "react";
import { SecondAuthContext } from "../contexts/SecondAuthContext";

export const useSecondAuth = () => {
    return useContext(SecondAuthContext);
};
