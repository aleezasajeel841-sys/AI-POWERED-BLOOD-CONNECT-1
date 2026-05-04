import { createContext, useReducer, useContext } from "react";

export const SecondAuthContext = createContext();

export const secondAuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return { secondUser: action.payload };
        case "LOGOUT":
            return { secondUser: null };
        default:
            return state;
    }
};

export const SecondAuthProvider = ({ children }) => {
    const storedUser = JSON.parse(localStorage.getItem("secondUser")) || null;
    const [state, dispatch] = useReducer(secondAuthReducer, { secondUser: storedUser });

    return (
        <SecondAuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </SecondAuthContext.Provider>
    );
};
