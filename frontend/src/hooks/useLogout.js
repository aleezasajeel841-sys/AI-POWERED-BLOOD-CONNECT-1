import { useAuthContext } from "./useAuthContext";
import { useSecondAuth } from "./useSecondAuth";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const { dispatch } = useAuthContext();
    const { secondUser, dispatch: secondAuthDispatch } = useSecondAuth(); // ✅ Get secondAuthDispatch
    const navigate = useNavigate();

    const secondLogout = () => {
        if (localStorage.getItem("secondUser") || secondUser) {
            localStorage.removeItem("secondUser");
            secondAuthDispatch({ type: "LOGOUT" }); // ✅ Dispatch logout for second user
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });

        secondLogout(); // ✅ Ensure second user logs out

        navigate("/"); // ✅ Always navigate to home
    };

    return { logout };
};
